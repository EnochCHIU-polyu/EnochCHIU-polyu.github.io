---
title: Ethereum Wallets
description: A protocol-accurate guide to EOAs, smart wallets, key derivation, custody models, and account abstraction.
---

## Part 1: What a Wallet Is (Execution-Layer Precise)

An Ethereum wallet is primarily a key-management and signing system, not an on-chain account itself.

At the execution layer (EL), the chain processes signed transactions and state transitions. Wallet software does three core jobs:

1. Manages signing authority (private keys or equivalent signing shares).
2. Builds/signs transaction payloads (or UserOperations for ERC-4337 flows).
3. Broadcasts data to the appropriate network path (public txpool, private relay, or ERC-4337 bundler path).

Important distinction:

- Wallet: off-chain software/hardware/service that controls signing.
- Account: on-chain state object (EOA or contract account).

## Part 2: Wallet Types in Ethereum

### 1. EOA Wallets

EOA wallets control secp256k1 private keys directly.

- EOAs sign execution-layer transaction envelopes supported by the active fork and client tooling (commonly type-0/1/2/3, and type-0x04 where EIP-7702 is active).
- Nonce is consumed by each sent transaction.
- Native behavior is simple and widely supported.

Examples: MetaMask (EOA mode), Ledger with EOA account, Trezor with EOA account.

### 2. Smart Contract Wallets (Smart Accounts)

Smart contract wallets are contract accounts with programmable authorization and policy logic.

- Signature checks and spending rules are implemented in contract code.
- Features can include multisig, session keys, spending limits, social recovery, and batched calls.
- Execution semantics depend on wallet contract implementation.

Examples: Safe smart accounts and other contract wallet frameworks.

### 3. Account Abstraction (ERC-4337 Model)

ERC-4337 is an application-layer account abstraction system (not native protocol replacement of EL tx format).

Core objects and actors:

- UserOperation: wallet intent object (not an EL transaction by itself).
- Bundler: service that collects UserOperations and submits an EL transaction.
- EntryPoint: on-chain contract that validates and executes UserOperations.
- Paymaster (optional): can sponsor gas under policy constraints.

Flow (simplified):

1. User signs a UserOperation.
2. Bundler simulates and selects UserOperations.
3. Bundler submits a transaction calling EntryPoint.
4. EntryPoint verifies and executes wallet logic.

## Part 3: Seed Phrases, HD Derivation, and Addressing

### 1. Standards and Scope

- BIP-32: hierarchical deterministic key tree.
- BIP-39: mnemonic-to-seed process.
- BIP-44: multi-account derivation path structure.

Ethereum commonly uses:

$$
m / 44' / 60' / account' / change / index
$$

Where coin type 60 is Ethereum (SLIP-44 registry).

### 2. Bitcoin Standards Often Confused with Ethereum

BIP-49 and BIP-84 describe Bitcoin SegWit address/script standards. They are not Ethereum address formats.

### 3. Public Key and Address Relationship

For EOAs, the Ethereum address is derived from the public key hash truncation process. Practically:

- Private key -> public key -> keccak256(public key without 0x04 prefix) -> last 20 bytes.

One-way implication:

- Public key can produce address.
- Address alone cannot recover the public key for arbitrary accounts before a signature reveals needed data.

## Part 4: Custody and Key-Control Models

### 1. Self-Custody

User controls signing authority.

Typical implementations:

- Software wallet (desktop/mobile, optionally OS enclave-backed).
- Hardware wallet.
- Air-gapped signing device.

### 2. Custodial Wallets

Service provider controls keys/signing.

Typical implementations:

- Exchange custody accounts.
- Managed wallet infrastructure providers.

### 3. Institutional Patterns

- HSM-backed signing infrastructure.
- MPC/threshold signing architectures.
- Policy engines with role-based approval workflows.

Security note: custody model determines who can actually authorize movement of funds.

## Part 5: MPC, Multisig, and Threshold Control

These are related but different:

- Multisig: on-chain policy requiring multiple signatures/approvals according to contract/script rules.
- MPC/threshold signing: off-chain cryptographic protocol producing a valid signature without reconstructing a full private key in one place.

Clarification:

- Multisig concept is broadly portable, but each chain implements it differently at protocol/contract level.
- MPC is not automatically safer than multisig; security depends on implementation, key ceremonies, operational controls, and failure assumptions.

## Part 6: Execution-Layer Fee and Transaction Context

Wallets that submit EL transactions should be explicit about modern fee types:

- Type-2 (EIP-1559): base fee + priority fee with max fee caps.
- Type-3 (EIP-4844): execution gas fee plus blob gas fee caps.

For reliable UX, wallets should:

1. Distinguish includability constraints from final charged fee.
2. Handle replacement/cancel behavior via nonce + fee bumping policy.
3. Detect and explain failures (underpriced replacement, nonce too low, insufficient funds, execution revert).

## Part 7: Practical Wallet Taxonomy

A compact classification useful for architecture decisions:

1. Signer model:
- Single-key EOA.
- Contract wallet policy engine.
- MPC/threshold signer set.

2. Custody model:
- Self-custody.
- Custodial.
- Hybrid/enterprise governance.

3. Submission path:
- Public EL mempool.
- Private orderflow channels.
- ERC-4337 bundler path.

4. Security envelope:
- Hot software key.
- Hardware-backed key.
- Distributed signing with operational controls.

## Part 8: Common Mistakes to Avoid

1. Treating wallet app UI as equivalent to account semantics.
2. Mixing Bitcoin derivation/address conventions into Ethereum explanations.
3. Assuming ERC-4337 UserOperations are native EL transactions.
4. Ignoring type-3 blob fee caps in post-Dencun fee logic.
5. Assuming address alone proves key ownership without valid signature context.

## Part 9: References

- [Ethereum Accounts](https://ethereum.org/developers/docs/accounts/)
- [Ethereum Transactions](https://ethereum.org/developers/docs/transactions/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [ERC-4337 Docs](https://docs.erc4337.io/)
- [MetaMask Smart Accounts Overview](https://support.metamask.io/)
- [Safe Smart Account Docs](https://docs.safe.global/)
- [BIP-32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)

## Part 10: DIY Implementation Page

If you want a hands-on implementation tutorial (Python + local signing + raw tx broadcast), see:

- [DIY Ethereum Wallet](/ethereum/eth-wallet-diy/)
