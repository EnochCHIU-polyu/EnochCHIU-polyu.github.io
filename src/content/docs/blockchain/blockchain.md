---
title: Blockchain intro
description: A guide to understanding blockchain
---

## Part 1: Core Architectural Themes

At its core, blockchain is a distributed ledger that synchronizes data across participants, minimizing centralized control and eliminating a single point of failure.

![alt text](../../../assets/blockchain-ledger.png)

### How it works

**Blocks**: Data (such as transactions, asset ownership, or records) is grouped into files called blocks.

**Chaining**: Once a block is filled, it receives a unique cryptographic fingerprint (called a hash) and is permanently sealed and linked to the previous block.

**Consensus**: Instead of a single server, thousands of computers (nodes) on the network maintain identical copies of the ledger. These nodes must collectively agree (via consensus mechanisms) that a new block is valid before it is added. 


### Key Characteristics

**Immutability**: Once data is entered into a block, it is virtually impossible to alter or delete without changing all subsequent blocks, which requires the consensus of the entire network.

**Transparency**: Anyone on the network can view the transaction history, making the system highly auditable and trustworthy.

**Security**: Cryptography ensures that data cannot be tampered with or faked

## 1. All blockchains have:

- P2P network → nodes communicate
- Transactions → messages changing state
- Consensus rules
- State machine: processes transactions according to the consensus rules
- Blocks (history)
- Consensus algorithm (PoW / PoS)
- Incentives (rewards, gas)

### 2. Network Topology and Access Control

Blockchain networks differ based on who can read state, submit transactions, and validate blocks.
- Public/Permissionless chains:
	- Anyone can create keys, run nodes, and submit transactions.
	- Security comes from open participation and economic incentives.
- Permissioned/Private/Consortium chains:
	- Participants are known, approved, and role-based.
	- These models prioritize confidentiality, governance control, and predictable performance.

### 3. Validators, Consensus, and Security Base

Consensus is the trust mechanism that orders and finalizes transactions.

- Validator set:
	- Active nodes that verify transactions and produce or finalize blocks.
- Consensus mechanisms:
	- PoW: Security through computation; robust, but energy-intensive and relatively slow.
	- PoS: Security through stake and slashing; more efficient and scalable.
	- BFT variants: Fast finality with known validators, assuming more than two-thirds are honest.

Security inheritance model:

- Layer 1 (L1):
	- Maintains its own consensus, security, and settlement.
- Rollups (L2):
	- Execute transactions off-chain and post data or proofs to L1.
	- Inherit data availability and security from L1.
- Sidechains:
	- Independent consensus and validator set.
	- Interact through bridges and do not inherit L1 base security.

### 4. Operational Mechanics and Tokenomics

- Governance:
	- On-chain: Upgrades are implemented through token-based voting.
	- Off-chain: Upgrades are coordinated through social, developer, or consortium processes.
- Tokenomics:
	- Defines issuance, utility, incentives, and the fee model.
	- Tokens secure the network, pay gas fees, and align participant incentives.
- Privacy and compliance:
	- Techniques include ZK proofs, TEEs, and selective disclosure.
	- The objective is verifiability with controlled data exposure.
- Interoperability:
	- Bridges, relays, and standards (for example, IBC) connect chains.
- Scalability:
	- Rollups, parallel execution, sharding, and modular architectures.

[More about Blockchain](https://kauri.io/#communities/Getting%20started%20with%20dapp%20development/blockchain-explained/)

Next step: [eth](/ethereum/eth/)