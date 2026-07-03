---
title: DIY Ethereum Wallet (Python + Local Geth)
description: Build a minimal Ethereum wallet from scratch with web3.py, local keystore encryption, and local transaction signing.
---

## Why this wallet exists

Most wallet tutorials hide core mechanics behind browser extensions or hosted RPC providers.  
This page focuses on a **self-hosted wallet flow** so you understand every step:

1. Generate and own your account keys.
2. Store private keys in encrypted V3 keystore files.
3. Talk directly to your own Geth node.
4. Sign transactions locally, then broadcast raw tx bytes.

This is the same core architecture used by many backend wallet services.

---

## What you will build

A terminal wallet script (`diy_wallet.py`) with four commands:

- `create`: create account + encrypted keystore
- `balance`: check ETH balance
- `estimate`: estimate transfer gas + fee
- `send`: sign and send ETH transfer

Design target:

- No MetaMask
- Self-hosted node preferred (public RPC allowed for learning)
- No plaintext private key in code/config

---

## Prerequisites

### 1)  Node connection

This guide is designed for a local node workflow, but running a full node can require significant hardware, storage, and bandwidth.

Choose one of these paths:

1. **Full local node path** (recommended for long-term self-hosting)
     - Run your own Geth JSON-RPC endpoint at `http://127.0.0.1:8545`.
     - Typical options include Ethereum mainnet (fully synced), Sepolia/Holesky, or a local dev chain.
     - Best for reliability, privacy, and learning full infrastructure ownership.

2. **Quick testnet path** (recommended for first try)
     - If you want to learn the wallet flow without managing node hardware first, use a Sepolia public RPC.
     - Example:

```bash
python diy_wallet.py balance \
    --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
    --keystore ./keystore/my-wallet.json
```

You can use the same `--rpc-url` pattern for `estimate` and `send`.

Quick health checks:

Local node (`127.0.0.1:8545`):

```bash
curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Custom RPC (example: Sepolia public endpoint):

```bash
curl -s -X POST https://ethereum-sepolia-rpc.publicnode.com \
    -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

If this fails, the wallet script cannot work yet.

### 2) Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install web3
```

---

## DIY wallet requirements (must-have)

A DIY wallet is flexible, but it is **not** free-form. If you want it to work safely on Ethereum, your implementation should follow these baseline requirements:

1. **Key/account correctness**
   - Use Ethereum-compatible secp256k1 keypairs.
   - Derive and validate addresses correctly (with checksum when used in UI/CLI).
2. **Keystore standard**
   - Store private keys in encrypted **Web3 Secret Storage V3** JSON format.
   - Never hardcode or store raw private keys in source/config.
3. **Transaction correctness**
   - Build tx with correct `nonce`, `chainId`, `to`, `value`, and gas fields.
   - Sign locally and broadcast raw signed bytes (`eth_sendRawTransaction`).

    Example (EIP-1559 transaction request):

```ts
const txRequest = {
     to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", // Recipient address
     value: ethers.parseEther("0.1"),                  // Amount to send (0.1 ETH)
     nonce: nonce,
     chainId: chainId,
     gasLimit: 21000,                                  // Standard gas limit for ETH transfer

     // EIP-1559 gas pricing (recommended over legacy gasPrice)
     maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
     maxFeePerGas: feeData.maxFeePerGas,
};
```



4. **RPC compatibility**
   - Use standard JSON-RPC calls (`eth_getBalance`, `eth_estimateGas`, `eth_sendRawTransaction`, etc.).
   - Handle node/network errors explicitly.
5. **Security baseline**
   - Prompt passwords securely (`getpass`).
   - Keep key material in memory for shortest time possible and wipe after use.
   - Restrict keystore file permissions (for example `0600` on Linux/macOS).

In short: you can customize UX and code structure, but these core protocol + security functions are required.
---

## Security model (important)

- Keystore uses **Web3 Secret Storage Definition (V3)**.
- Password is entered with `getpass` (not echoed).
- Private key is kept in memory only for decrypt/sign operations.
- Script wipes mutable key bytes after use.
- File permissions are set to `0600`.

What this script is **not**:

- Not a hardware-wallet replacement.
- Not malware-proof if host machine is compromised.
- Not multi-sig or policy engine.

Use small amounts first and secure your backups.

---

## Full script: `diy_wallet.py`

```python
#!/usr/bin/env python3
"""
DIY Ethereum wallet CLI using local Geth RPC.

Commands:
- create: generate account and save encrypted V3 keystore
- balance: read ETH balance
- estimate: estimate gas + fee for ETH transfer
- send: sign locally and broadcast tx
"""

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
    serialized = json.dumps(data, indent=2)
    with open(path, "w", encoding="utf-8") as f:
        f.write(serialized)
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
    print("Back up keystore + password securely.")


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
        fail(f"Keystore decrypt failed (wrong password or corrupt file): {exc}")

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
    base_fee = w3.eth.get_block("latest").baseFeePerGas
    if base_fee is None:
        fail("Connected network does not expose baseFeePerGas (EIP-1559 required)")
    priority_fee = w3.eth.max_priority_fee
    suggested_max_fee = base_fee * 2 + priority_fee
    fee_wei = gas_limit * suggested_max_fee

    print(f"From: {sender}")
    print(f"To: {to}")
    print(f"Amount: {amount_eth} ETH ({value_wei} wei)")
    print(f"Estimated gas limit: {gas_limit}")
    print(f"Base fee: {base_fee} wei")
    print(f"Priority fee: {priority_fee} wei")
    print(f"Suggested max fee: {suggested_max_fee} wei")
    print(f"Estimated max fee spend: {w3.from_wei(fee_wei, 'ether')} ETH ({fee_wei} wei)")


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

    # EIP-1559 fee selection with optional user overrides.
    base_fee = w3.eth.get_block("latest").baseFeePerGas
    if base_fee is None:
        fail("Connected network does not expose baseFeePerGas (EIP-1559 required)")

    default_priority_fee = w3.eth.max_priority_fee
    max_priority_fee = (
        w3.to_wei(max_priority_fee_gwei, "gwei")
        if max_priority_fee_gwei is not None
        else default_priority_fee
    )

    max_fee = (
        w3.to_wei(max_fee_gwei, "gwei")
        if max_fee_gwei is not None
        else base_fee * 2 + max_priority_fee
    )

    if max_fee < max_priority_fee:
        fail("maxFeePerGas must be greater than or equal to maxPriorityFeePerGas")

    tx = {
        "type": 2,
        "nonce": nonce,
        "to": to,
        "value": value_wei,
        "gas": gas_limit,
        "maxFeePerGas": max_fee,
        "maxPriorityFeePerGas": max_priority_fee,
        "chainId": chain_id,
    }

    try:
        signed = w3.eth.account.sign_transaction(tx, private_key=bytes(account.key_material))
        tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    except Exception as exc:
        fail(f"Sign or broadcast failed: {exc}")
    finally:
        wipe_key(account)

    print(f"Broadcasted tx hash: {tx_hash.hex()}")
    print("Waiting for receipt...")

    try:
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180, poll_latency=2)
    except (TimeExhausted, TransactionNotFound) as exc:
        fail(f"Transaction receipt not found in time: {exc}")

    print(f"Block: {receipt.blockNumber}")
    print(f"Status: {'success' if receipt.status == 1 else 'reverted'}")
    print(f"Gas used: {receipt.gasUsed}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="DIY Ethereum wallet CLI")
    parser.add_argument("--rpc-url", default=DEFAULT_RPC_URL, help=f"RPC URL (default: {DEFAULT_RPC_URL})")

    sub = parser.add_subparsers(dest="command", required=True)

    p_create = sub.add_parser("create", help="Create account and keystore")
    p_create.add_argument("--keystore", required=True, help="Keystore output path")

    p_balance = sub.add_parser("balance", help="Check account ETH balance")
    p_balance.add_argument("--keystore", required=True, help="Keystore file path")

    p_estimate = sub.add_parser("estimate", help="Estimate gas for ETH transfer")
    p_estimate.add_argument("--keystore", required=True, help="Sender keystore file path")
    p_estimate.add_argument("--to", required=True, help="Recipient address")
    p_estimate.add_argument("--amount-eth", required=True, help="Amount in ETH, e.g. 0.01")

    p_send = sub.add_parser("send", help="Send ETH transfer")
    p_send.add_argument("--keystore", required=True, help="Sender keystore file path")
    p_send.add_argument("--to", required=True, help="Recipient address")
    p_send.add_argument("--amount-eth", required=True, help="Amount in ETH, e.g. 0.01")
    p_send.add_argument("--max-fee-gwei", help="Optional maxFeePerGas in gwei")
    p_send.add_argument("--max-priority-fee-gwei", help="Optional maxPriorityFeePerGas in gwei")

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
        max_priority_fee = (
            parse_gwei_positive(args.max_priority_fee_gwei, "max priority fee")
            if args.max_priority_fee_gwei
            else None
        )
        send_eth(w3, loaded, to_addr, amount_eth, max_fee, max_priority_fee)
        return

    fail(f"Unsupported command: {args.command}")


if __name__ == "__main__":
    main()
```

---

## What this wallet can do

### 1) Create wallet

```bash
python diy_wallet.py create --keystore ./keystore/my-wallet.json
```

You will enter password twice. Output includes your new address.

### 2) Fund address

Send ETH to that address (from faucet/test wallet/another account) so it can pay gas.

### 3) Check balance

```bash
python diy_wallet.py balance --keystore ./keystore/my-wallet.json
```

### 4) Estimate fee before sending

```bash
python diy_wallet.py estimate \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01
```

### 5) Send ETH

```bash
python diy_wallet.py send \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01
```

Optional EIP-1559 fee override:

```bash
python diy_wallet.py send \
  --keystore ./keystore/my-wallet.json \
  --to 0xRecipientAddress \
  --amount-eth 0.01 \
    --max-priority-fee-gwei 2 \
    --max-fee-gwei 60
```

---

## Mainnet usage notes

Yes, it works on Ethereum mainnet if your local Geth is synced to mainnet.

- Keep default `--rpc-url` if node is at `127.0.0.1:8545`.
- Ensure enough ETH for transfer value + gas.
- Start with tiny transfers.
- For production, add monitoring/retry strategy around broadcast and confirmation.

---

## Common errors and fixes

- **Cannot connect to node**  
  Geth RPC is not running or wrong host/port.

- **Keystore decrypt failed**  
  Wrong password or corrupted JSON file.

- **insufficient funds**  
  Balance cannot cover `amount + gas`.

- **replacement transaction underpriced**  
    Same nonce already pending with higher fee; raise max fee / priority fee or wait.

- **receipt timeout**  
  Node not syncing or network congestion; inspect tx hash on explorer / local RPC.

---

## Next improvements (if you continue building)

- Add automatic fee bumping for replacement transactions
- Add token transfers (ERC-20)
- Add nonce management for concurrent sends
- Add offline signing mode (air-gapped workflow)