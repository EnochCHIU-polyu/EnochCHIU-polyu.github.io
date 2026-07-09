---
title: Hash
description: A detailed guide to cryptographic hashing in Ethereum, from basics to current protocol usage.
---

## Part 0: What a Hash Is

A cryptographic hash function takes input of any size and produces a fixed-size digest.

In Ethereum, hashes are used as compact fingerprints for data. They are not encryption. A hash is designed to be one-way: easy to compute, hard to reverse.

Typical hash properties:

- Deterministic: the same input always gives the same output.
- Fixed length: for Ethereum's main execution-layer hash, the output is 32 bytes.
- Preimage resistant: given a hash, it is computationally infeasible to recover the original input.
- Collision resistant: it is computationally infeasible to find two different inputs with the same hash.
- Avalanche effect: a tiny input change produces a very different output.

Simple model:

$$
h = H(m)
$$

Where:

- $m$ is the message or data.
- $H$ is the hash function.
- $h$ is the digest.

## Part 1: Why Ethereum Uses Hashes

Hashes are a core building block across Ethereum's execution layer and consensus layer.

Common uses include:

1. Transaction identifiers.
2. Block identifiers.
3. Address derivation.
4. Merkle and Patricia trie commitments.
5. Signature message digests.
6. Log topic filtering.
7. Storage slot calculation.
8. Commitment schemes for state and data availability.

In practice, hashes make Ethereum compact, verifiable, and tamper-evident.

## Part 2: The Hash Functions Ethereum Actually Uses

### 1. Keccak-256 on the execution layer

Ethereum's execution layer uses Keccak-256 extensively.

Important clarification:

- Ethereum uses Keccak-256, not NIST SHA3-256.
- The difference is subtle but real: SHA-3 standardized padding differs from the Keccak variant Ethereum adopted earlier.

You will see Keccak-256 in:

- transaction signing prehashes,
- transaction hashes,
- block hashes,
- address derivation from public keys,
- contract storage slot derivation,
- event signature hashing,
- trie node hashing.

### 2. SHA-256 on the consensus layer

The consensus layer uses SSZ and SHA-256 in many places.

Examples include:

- SSZ object hashing,
- Merkleization,
- Beacon chain data commitments.

So Ethereum is not “one hash function everywhere.” The two layers use different primitives for different designs.

### 3. KZG commitments for blobs

After EIP-4844, blob data is not committed with ordinary hash trees alone.

- Blob payloads are committed using KZG polynomial commitments.
- The transaction carries versioned blob hashes derived from the commitment.
- This reduces execution-layer storage burden while preserving verifiability.

That means modern Ethereum data availability is hash-heavy, but not hash-only.

## Part 3: Hashing in Everyday Ethereum Work

### 1. Transaction hashing

Every transaction is encoded, signed, and then identified by a transaction hash.

The hash is useful because it gives a stable identifier for indexing, mempool tracking, receipts, and explorers.

For typed transactions, the signed payload includes the transaction type and structured fields before hashing and signing.

### 2. Block hashing

A block hash identifies a block header.

For execution-layer blocks, the header includes fields such as:

- parent hash,
- state root,
- transactions root,
- receipts root,
- logs bloom,
- gas fields,
- timestamp,
- extra data,
- base fee per gas,
- withdrawals root or other fork-specific fields.

Any change in the header changes the block hash.

### 3. Address derivation

For EOAs, the address is derived from the public key hash.

In simplified form:

$$
address = last\ 20\ bytes(Keccak256(publicKey))
$$

This is not encryption. It is a one-way derivation used to compress a public key into a shorter identifier.

### 4. Smart contract deployment addresses

Contract addresses are also hash-derived.

Historically, the address is computed from the creator address and creator nonce. For CREATE2, the formula includes the deployer, salt, and init code hash.

CREATE2 is especially important in modern wallet and account-abstraction workflows because it lets developers precompute contract addresses before deployment.

### 5. Storage and mapping slots

Solidity mappings do not store keys directly. Instead, they hash key material into a storage slot location.

Conceptually:

$$
slot = Keccak256(encode(key) \parallel encode(baseSlot))
$$

This is why mapping access is fast and why storage locations are deterministic.

### 6. Events and logs

Event signatures are hashed into topics.

For example, an event declaration like:

```solidity
Transfer(address,address,uint256)
```

is hashed to produce the first log topic, which makes event filtering efficient and standardized.

## Part 4: Hashing and the Merkle Trie

Ethereum state is organized with authenticated data structures.

At the execution layer, the state is committed with tries that use hashing at every level.

Core ideas:

- Leaves store data such as accounts, storage, or transactions.
- Internal nodes are hashed together to build a root commitment.
- The root hash proves the whole structure.

This gives Ethereum a compact state root that changes whenever any committed state changes.

Why it matters:

- Light clients can verify proofs against the root.
- Nodes can detect tampering.
- A small root value can represent a huge state space.

## Part 5: Hashing, Proofs, and Verification

Hashes are the foundation of proofs in Ethereum.

Examples include:

1. Merkle proofs for state or receipt inclusion.
2. Trie proofs for account/storage queries.
3. Commitment proofs for block and beacon data.
4. Signature digests used in authorization.

General proof idea:

$$
leaf \rightarrow hash \rightarrow parent\ hash \rightarrow root
$$

If a verifier can recompute the root from a proof and compare it with the known root, the data is authenticated.

## Part 6: Keccak-256 vs SHA-3

This distinction is one of the most common points of confusion.

### 1. What Ethereum uses

Ethereum uses Keccak-256 in many execution-layer contexts.

### 2. What people often assume

Many libraries expose a function named SHA3-256, but that is not the same as Ethereum's historical Keccak-256 variant.

### 3. Why the difference matters

If you hash with the wrong variant, you get a different digest.

That can break:

- address generation,
- contract slot calculation,
- signature prehashing,
- event topic derivation,
- proof verification.

Always check the exact hash primitive used by the protocol or library.

## Part 7: Short Summary

Hashes let Ethereum compress, commit, authenticate, and reference data safely.

If you remember only one thing:

- Ethereum execution-layer hashing is mostly Keccak-256.
- Consensus-layer hashing often uses SHA-256 via SSZ.
- Blob-era Ethereum adds KZG commitments on top of that.

That combination is what makes the protocol compact, verifiable, and scalable.
