---
title: Cryptography
description: A guide to Ethereum cryptographic primitives, signatures, hashing, and proofs.
---

## Part 0: Block detail can be see

Note that, all communications with the Ethereum platform and between nodes (including transaction data) are unencrypted and can (necessarily) be read by anyone.

## Part 1: Public key cryptography (PKC)

**Used to control ownership of funds, in the form of private keys and addresses.**

### 1. Private keys

- A private key is a random number in a valid elliptic-curve range.
- Control of the private key equals control of the corresponding EOA funds and permissions.
- Private keys are never posted on-chain and must never be shared.

Security notes:

- Use strong entropy and a cryptographically secure RNG.
- Never use predictable random generation logic.
- Back up keys safely; loss of the key means irreversible loss of control.

### 2. Public keys

- Ethereum EOAs use elliptic curve cryptography on `secp256k1`.
- Public key derivation follows one-way math: `K = k * G`.
- It is practical to compute public keys from private keys, but computationally infeasible to reverse.

### 3. Transaction signatures

- EOAs sign transaction payloads with ECDSA.
- Nodes verify signatures before accepting and executing transactions.
- Signature validation proves authorization without revealing the private key.

## Part 3: Hashing and Address Derivation

### 1. Cryptographic hash properties

Ethereum depends heavily on one-way hash behavior:

- Deterministic outputs for the same input.
- Strong avalanche effect for small input changes.
- Practical preimage and collision resistance.

### 2. Keccak-256 in Ethereum

- Ethereum uses Keccak-256 (not FIPS-202 SHA-3 output compatibility).
- Keccak is used across IDs, commitments, trie roots, and address derivation.

### 3. Address derivation

- EOA address = last 20 bytes of `keccak256(publicKey)`.
- Displayed in hex form with `0x` prefix.
- Checksum-style mixed-case encoding (ERC-55) helps detect typing mistakes.

## Part 4: Commitments in Execution and State

Ethereum commits global data using authenticated structures:

- `stateRoot`: commitment to global account and storage state.
- `transactionsRoot`: commitment to included transactions.
- `receiptsRoot`: commitment to outcomes and logs.

These roots allow compact verification of large datasets.

## Part 5: Validator Cryptography (Consensus Layer)

PoS consensus requires authenticated validator messages.

- Validators sign attestations and proposals.
- Misbehavior (for example, conflicting signatures) becomes provable.
- Provable misbehavior enables slashing.

Ethereum uses BLS signatures for validator messaging because they support aggregation:

- Many signatures can be compressed into one aggregate signature.
- Verification cost and block footprint are reduced versus verifying each vote independently.
- This is a key scaling property for large validator sets.

## Part 6: KZG Commitments and Blob Era

With proto-danksharding (EIP-4844), Ethereum introduced blob-related commitment verification.

Conceptually:

- Data is represented in polynomial form.
- A commitment is published on-chain.
- Small proofs allow validators and nodes to verify specific claims about that committed data.

KZG commitment schemes provide:

- Constant-size commitments.
- Small proofs.
- Efficient verification independent of full data size.

This direction supports Ethereum scalability and data-availability roadmaps.

## Part 7: Summary

Ethereum cryptography spans two major domains:

- Execution-layer cryptography: ECDSA, Keccak-256, and trie commitments.
- Consensus-layer and data cryptography: BLS aggregation and KZG commitments.

Together, these mechanisms make decentralized verification practical at global scale.

Next step: [eth-account](/ethereum/eth-account/)
