---
title: Accounts (20 Bytes)
description: A guide to Ethereum account types, fields, and address generation.
---
Ethereum accounts are identified by 20-byte addresses.
![Account Overview](../../../assets/eth-account.png)
## Part 1: Account State Fields

In the Ethereum execution state, each account has four canonical fields:

| Field         | Description                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `nonce`       | For EOAs, the number of transactions sent; for contract accounts, the number of contracts created via `CREATE`. |
| `balance`     | The amount of ETH held by the account.                                                                          |
| `storageRoot` | The root hash of the contract storage trie; for EOAs, this is the empty trie root.                              |
| `codeHash`    | The hash of the account bytecode; for EOAs, this is the empty code hash.                                        |

## Part 2: Account Types

Ethereum has two account types. Both follow the same four-field state model, but practical code/storage behavior differs.

### Externally Owned Account (EOA)

- Controlled by a private key (public/private key pair).
- Can initiate transactions.
- `code` is empty.
- `storage` is empty.
- Creating an EOA does not require deployment; it typically first appears in state when funded or when it sends its first transaction.
- In HD wallets (for example MetaMask), multiple EOAs can be derived from one mnemonic using different derivation indices.

### Contract Account

- Controlled by smart contract code.
- Can hold ETH and interact with EOAs and other contracts.
- Has non-empty `code` and can use `storage`.
- Creation requires deployment gas because bytecode and state are written to the chain.
- Cannot originate transactions by itself; execution is triggered by external transactions or internal calls.

## Part 3: Ethereum Address Generation

### EOA Address Derivation

1. Generate a private key `sk` (ECDSA over `secp256k1`).
2. Derive public key `pk` from `sk`.
3. Compute `keccak256(pk[1:])` using the uncompressed public key without the `0x04` prefix byte.
4. Take the last 20 bytes (160 bits) of that hash as the Ethereum address.

Example:

- `keccak256(pk[1:]) = 2a5bc342ed616b5ba5732269001d3f1ef827552ae1114027bd3ecf1f086ba0f9001d3f1ef827552ae1114027bd3ecf1f086ba0f9`
- `address = 0x001d3f1ef827552ae1114027bd3ecf1f086ba0f9`

### Contract Address Derivation

Contract addresses are derived from deployment context:

- `CREATE`: `new_address = keccak256(rlp([sender, nonce]))[12:]`
- `CREATE2`: `new_address = keccak256(0xff ++ sender ++ salt ++ keccak256(init_code))[12:]`

Both methods produce a contract address, but `CREATE2` enables deterministic address computation before deployment.


