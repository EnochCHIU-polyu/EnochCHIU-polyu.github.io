---
title: Merkle, Merkle Patricia Trie, and Verkle Trees
description: A protocol-accurate guide to Bitcoin-style Merkle trees, Ethereum's Merkle Patricia Tries, and the Verkle-tree roadmap.
---

## Part 1: Why These Data Structures Matter

Ethereum execution clients must prove that block data and state data are consistent with header commitments.

The block header commits to key roots:

- `stateRoot`
- `transactionsRoot`
- `receiptsRoot`

These commitments let nodes verify data integrity and inclusion proofs without trusting a single database copy.

## Part 2: Merkle Tree Basics

A Merkle tree is a binary hash tree where:

1. Leaves hash data items.
2. Internal nodes hash child hashes.
3. Root hash commits to the full set.

Core property:

- Any leaf change changes the root.

In Bitcoin, Merkle trees are mainly used to commit block transactions via a transaction Merkle root.

## Part 3: Ethereum's Merkle Patricia Trie (MPT)

Ethereum uses a Modified Merkle Patricia Trie (often called MPT) instead of a simple binary Merkle tree for state-like key-value data.

Why trie + Merkle:

1. Trie structure supports key-value lookups and updates.
2. Merkle hashing provides tamper-evident root commitments.
3. Path compression improves storage efficiency over naive trie forms.

At a high level, Ethereum uses tries for:

- Global state trie (`stateRoot`)
- Per-block transaction trie (`transactionsRoot`)
- Per-block receipts trie (`receiptsRoot`)

## Part 4: The Three Header Roots in EL Context

### 1. State Root (`stateRoot`)

Commits the full post-block world state (accounts and contract storage commitments).

### 2. Transactions Root (`transactionsRoot`)

Commits the ordered list of transactions included in the block body.

### 3. Receipts Root (`receiptsRoot`)

Commits transaction receipts (status, cumulative gas used, logs bloom, logs, and other receipt fields).

Execution-layer verification checks that locally computed roots match header claims.

## Part 5: Proofs and Verification Intuition

A Merkle-Patricia proof provides path evidence from a queried key/value to a committed root.

Verification idea:

1. Recompute node hashes along the proof path.
2. Check the recomputed root equals the trusted root from block header.

If roots match, the proof is valid under that header commitment.

## Part 6: Performance and Design Tradeoffs

MPT strengths:

- Strong commitment security model.
- Deterministic, consensus-safe encoding and hashing.
- Supports authenticated key-value queries.

MPT pain points:

- Larger proof sizes than newer commitment schemes.
- Expensive witness sizes for stateless validation goals.
- Database complexity under frequent state updates.

## Part 7: Verkle Trees (Roadmap Direction)

Verkle trees are proposed as a future commitment structure to reduce proof sizes and improve stateless-client feasibility.

High-level motivation:

1. Smaller witnesses for state proofs.
2. Better scalability for proof-heavy workflows.
3. Improved path toward more efficient stateless verification.

Important status note:

- Verkle migration is a roadmap effort and depends on protocol-fork rollout.
- Always check current mainnet fork status before assuming production deployment.

## Part 8: Practical Reading Path

1. Learn Merkle-tree hashing and inclusion proofs first.
2. Understand why Ethereum uses trie-based authenticated maps, not only binary trees.
3. Map each EL header root to its trie and verification boundary.
4. Then study Verkle-tree motivation as a proof-size and statelessness upgrade path.

## Part 9: References

### Merkle tree

- [Merkle tree in Bitcoin - BitcoinWiki](https://en.bitcoinwiki.org/wiki/Merkle_tree)
- [Merkle Tree with real world examples - YouTube](https://www.youtube.com/watch?v=qHMLy5JjbjQ)
- [What is the merkle tree in Bitcoin? - YouTube](https://www.youtube.com/watch?v=V6gLY-1G4Mc&t=8s)
- [How Merkle Trees Enable the Decentralized Web! - YouTube](https://www.youtube.com/watch?v=YIc6MNfv5iQ)

### Merkle Patricia Trie

- [Merkle Patricia Trie | ethereum.org](https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/)
- [What are Patricia Merkle Tries? | Alchemy Docs](https://www.alchemy.com/docs/patricia-merkle-tries)
- [Ethereum Merkle Patricia Tree overview (Zhihu)](https://zhuanlan.zhihu.com/p/46702178)

### Verkle Trees

- [Verkle trees (Vitalik)](https://vitalik.eth.limo/general/2021/06/18/verkle.html)
- [Verkle trees | ethereum.org](https://ethereum.org/roadmap/verkle-trees/)
- [Verkle tree structure | Ethereum Foundation Blog](https://blog.ethereum.org/2021/12/02/verkle-tree-structure)
- [What are Verkle Trees in Ethereum?](https://blog.web3labs.com/what-are-verkle-trees-in-ethereum/)
- [The Verge: Verkle Trees overview](https://medium.com/@zan.top/the-verge-ethereums-efficient-verifiable-query-technique-verkle-trees-a063f1b9d4b0)
- [Verkle Trees and stateless verification (Chinese)](https://www.blocktempo.com/verkle-trees-for-statelessness/)
