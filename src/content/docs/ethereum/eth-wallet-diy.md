---
title: DIY Ethereum Wallet (Python)
description: Build a minimal EOA wallet with encrypted keystore, local signing, and raw transaction broadcast.
---

## Part 1: Scope and Model

This page is a practical implementation companion to the wallet architecture page.

Scope of this DIY build:

1. EOA wallet only (secp256k1 key, encrypted keystore).
2. ETH transfer flow using type-2 (EIP-1559) transactions.
3. Local signing and `eth_sendRawTransaction` broadcast.

Out of scope:

- ERC-4337 UserOperation flow.
- Smart contract wallet policy engines.
- Custodial or MPC production infrastructure.

## Part 2: Prerequisites

### 1. Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install web3
```

### 2. RPC endpoint

Use one:

1. Local execution client RPC (preferred for self-hosting):
- `http://127.0.0.1:8545`

2. Public testnet RPC for learning:
- for example Sepolia endpoint

Health check example:

```bash
curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

## Part 3: Security Baseline

1. Store keys only in encrypted keystore (Web3 Secret Storage V3).
2. Prompt password via `getpass` (no echo).
3. Keep decrypted key material in memory briefly and wipe after signing.
4. Restrict keystore file permissions (for example `0600` on Linux/macOS).
5. Test with small amounts first.

## Part 4: Wallet Script

Create `diy_wallet.py`:

```python
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import getpass
import json
import os
import sys
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from eth_account import Account
from web3 import Web3
from web3.exceptions import TimeExhausted, TransactionNotFound


DEFAULT_RPC_URL = "http://127.0.0.1:8545"


@dataclass
class LoadedAccount:
    address: str
    key_material: bytearray


def fail(message: str, code: int = 1) -> None:
    print(f"Error: {message}", file=sys.stderr)
    raise SystemExit(code)


def make_web3(rpc_url: str) -> Web3:
    w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        fail(f"Cannot connect to node at {rpc_url}")
    return w3


def parse_eth_amount(amount: str) -> Decimal:
    try:
        dec = Decimal(amount)
    except InvalidOperation as exc:
        fail(f"Invalid ETH amount '{amount}': {exc}")
    if dec <= 0:
        fail("Amount must be greater than 0")
    return dec


def parse_gwei_positive(value: str, field_name: str) -> Decimal:
    try:
        dec = Decimal(value)
    except InvalidOperation as exc:
        fail(f"Invalid {field_name} '{value}': {exc}")
    if dec <= 0:
        fail(f"{field_name} must be greater than 0")
    return dec


def parse_address(raw: str) -> str:
    if not Web3.is_address(raw):
        fail(f"Invalid Ethereum address: {raw}")
    return Web3.to_checksum_address(raw)


def write_json_secure(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.chmod(path, 0o600)


def create_account(keystore_path: Path) -> None:
    password_1 = getpass.getpass("Create keystore password: ")
    password_2 = getpass.getpass("Confirm keystore password: ")
    if password_1 != password_2:
        fail("Passwords do not match")
    if len(password_1) < 10:
        fail("Use at least 10 characters for keystore password")

    acct = Account.create()
    encrypted = Account.encrypt(acct.key, password_1)
    write_json_secure(keystore_path, encrypted)

    print("Account created.")
    print(f"Address: {acct.address}")
    print(f"Keystore: {keystore_path}")


def load_account_from_keystore(keystore_path: Path) -> LoadedAccount:
    if not keystore_path.exists():
        fail(f"Keystore file not found: {keystore_path}")

    with open(keystore_path, "r", encoding="utf-8") as f:
        keystore = json.load(f)

    addr = keystore.get("address")
    if not addr:
        fail("Invalid keystore: missing address")

    password = getpass.getpass("Keystore password: ")
    try:
        key_bytes = Account.decrypt(keystore, password)
    except (ValueError, KeyError, TypeError) as exc:
        fail(f"Keystore decrypt failed: {exc}")

    return LoadedAccount(
        address=Web3.to_checksum_address("0x" + addr),
        key_material=bytearray(key_bytes),
    )


def wipe_key(account: LoadedAccount) -> None:
    for i in range(len(account.key_material)):
        account.key_material[i] = 0


def get_balance(w3: Web3, address: str) -> None:
    wei = w3.eth.get_balance(address)
    print(f"Address: {address}")
    print(f"Balance: {w3.from_wei(wei, 'ether')} ETH ({wei} wei)")


def estimate_transfer_gas(w3: Web3, sender: str, to: str, amount_eth: Decimal) -> None:
    value_wei = w3.to_wei(amount_eth, "ether")
    tx = {"from": sender, "to": to, "value": value_wei}

    gas_limit = w3.eth.estimate_gas(tx)
    latest = w3.eth.get_block("latest")
    base_fee = latest.baseFeePerGas
    if base_fee is None:
        fail("Connected network does not expose baseFeePerGas")

    priority_fee = w3.eth.max_priority_fee
    suggested_max_fee = base_fee * 2 + priority_fee
    max_fee_spend = gas_limit * suggested_max_fee

    print(f"Estimated gas limit: {gas_limit}")
    print(f"Base fee: {base_fee} wei")
    print(f"Priority fee: {priority_fee} wei")
    print(f"Suggested maxFeePerGas: {suggested_max_fee} wei")
    print(f"Estimated max fee spend: {w3.from_wei(max_fee_spend, 'ether')} ETH ({max_fee_spend} wei)")


def send_eth(
    w3: Web3,
    account: LoadedAccount,
    to: str,
    amount_eth: Decimal,
    max_fee_gwei: Decimal | None,
    max_priority_fee_gwei: Decimal | None,
) -> None:
    sender = account.address
    value_wei = w3.to_wei(amount_eth, "ether")
    nonce = w3.eth.get_transaction_count(sender, "pending")
    chain_id = w3.eth.chain_id

    gas_limit = w3.eth.estimate_gas({"from": sender, "to": to, "value": value_wei})

    latest = w3.eth.get_block("latest")
    base_fee = latest.baseFeePerGas
    if base_fee is None:
        fail("Connected network does not expose baseFeePerGas")

    default_priority = w3.eth.max_priority_fee
    max_priority = w3.to_wei(max_priority_fee_gwei, "gwei") if max_priority_fee_gwei is not None else default_priority
    max_fee = w3.to_wei(max_fee_gwei, "gwei") if max_fee_gwei is not None else base_fee * 2 + max_priority

    if max_fee < max_priority:
        fail("maxFeePerGas must be >= maxPriorityFeePerGas")

    tx = {
        "type": 2,
        "chainId": chain_id,
        "nonce": nonce,
        "to": to,
        "value": value_wei,
        "gas": gas_limit,
        "maxFeePerGas": max_fee,
        "maxPriorityFeePerGas": max_priority,
    }

    try:
        signed = w3.eth.account.sign_transaction(tx, private_key=bytes(account.key_material))
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    except Exception as exc:
        fail(f"Sign or broadcast failed: {exc}")
    finally:
        wipe_key(account)

    print(f"Broadcasted tx: {tx_hash.hex()}")
    print("Waiting for receipt...")

    try:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180, poll_latency=2)
    except (TimeExhausted, TransactionNotFound) as exc:
        fail(f"Receipt not found in time: {exc}")

    print(f"Block: {receipt.blockNumber}")
    print(f"Status: {'success' if receipt.status == 1 else 'reverted'}")
    print(f"Gas used: {receipt.gasUsed}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="DIY Ethereum wallet CLI")
    parser.add_argument("--rpc-url", default=DEFAULT_RPC_URL, help=f"RPC URL (default: {DEFAULT_RPC_URL})")

    sub = parser.add_subparsers(dest="command", required=True)

    p_create = sub.add_parser("create")
    p_create.add_argument("--keystore", required=True)

    p_balance = sub.add_parser("balance")
    p_balance.add_argument("--keystore", required=True)

    p_estimate = sub.add_parser("estimate")
    p_estimate.add_argument("--keystore", required=True)
    p_estimate.add_argument("--to", required=True)
    p_estimate.add_argument("--amount-eth", required=True)

    p_send = sub.add_parser("send")
    p_send.add_argument("--keystore", required=True)
    p_send.add_argument("--to", required=True)
    p_send.add_argument("--amount-eth", required=True)
    p_send.add_argument("--max-fee-gwei")
    p_send.add_argument("--max-priority-fee-gwei")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "create":
        create_account(Path(args.keystore))
        return

    w3 = make_web3(args.rpc_url)
    loaded = load_account_from_keystore(Path(args.keystore))

    if args.command == "balance":
        try:
            get_balance(w3, loaded.address)
        finally:
            wipe_key(loaded)
        return

    to_addr = parse_address(args.to)
    amount_eth = parse_eth_amount(args.amount_eth)

    if args.command == "estimate":
        try:
            estimate_transfer_gas(w3, loaded.address, to_addr, amount_eth)
        finally:
            wipe_key(loaded)
        return

    if args.command == "send":
        max_fee = parse_gwei_positive(args.max_fee_gwei, "max fee") if args.max_fee_gwei else None
        max_priority = (
            parse_gwei_positive(args.max_priority_fee_gwei, "max priority fee")
            if args.max_priority_fee_gwei
            else None
        )
        send_eth(w3, loaded, to_addr, amount_eth, max_fee, max_priority)
        return

    fail(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    main()
```

## Part 5: CLI Usage

### 1. Create a keystore

```bash
python diy_wallet.py create --keystore ./keystore/my-wallet.json
```

### 2. Check balance

```bash
python diy_wallet.py balance \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --keystore ./keystore/my-wallet.json
```

### 3. Estimate transfer fee

```bash
python diy_wallet.py estimate \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01
```

### 4. Send ETH (type-2)

```bash
python diy_wallet.py send \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01
```

Optional fee overrides:

```bash
python diy_wallet.py send \
  --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01 \
  --max-priority-fee-gwei 2 \
  --max-fee-gwei 40
```

## Part 6: Protocol Notes

1. This script sends type-2 transactions only.
2. Final charged fee is based on `gasUsed * effectiveGasPrice`, not `gasLimit * maxFeePerGas`.
3. Upfront affordability still requires enough balance for `value + gasLimit * maxFeePerGas`.
4. Inclusion is not finality; use finalized-head policy for stronger settlement guarantees.

## Part 7: Related Reading

- [Ethereum Wallets](/ethereum/eth-wallet/)
- [Gas](/ethereum/eth-gas/)
- [Transaction Processing](/ethereum/eth-transaction/)
- [Transaction with Go code](/ethereum/eth-transaction-code/)
