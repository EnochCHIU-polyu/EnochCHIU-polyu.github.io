---
title: Blockchain intro
description: A guide for knowing blockchain
---
This beginner-to-intermediate guide explains blockchain architecture fundamentals, compares major platform designs

## Part 1: Core Architectural Themes

## 1. Network Topology and Access Control

Blockchain networks differ by who can read state, submit transactions, and validate blocks.
- Public/Permissionless chains:
	- Anyone can create keys, run nodes, and submit transactions.
	- Security comes from open participation and economic incentives.
- Permissioned/Private/Consortium chains:
	- Participants are known, approved, and role-based.
	- Prioritize confidentiality, control, and predictable performance.

## 2. Validators, Consensus, and Security Base

Consensus is the trust engine that orders and finalizes transactions.

- Validator set:
	- Active nodes that verify transactions and produce/finalize blocks.
- Consensus mechanisms:
	- PoW: security via computation; robust but energy-intensive and slower.
	- PoS: security via stake and slashing; more efficient and scalable.
	- BFT variants: fast finality with known validators if >2/3 are honest.

Security inheritance model:

- Layer 1 (L1):
	- Own consensus, own security, own settlement.
- Rollups (L2):
	- Execute off-chain and post data/proofs to L1.
	- Inherit data availability and security from L1.
- Sidechains:
	- Independent consensus and validator set.
	- Interact via bridges; do not inherit L1 base security.

## 3. Operational Mechanics and Tokenomics

- Governance:
	- On-chain: upgrades through token-based voting.
	- Off-chain: upgrades through social, developer, or consortium coordination.
- Tokenomics:
	- Defines issuance, utility, incentives, and fee model.
	- Tokens secure the network, pay gas, and align participants.
- Privacy and compliance:
	- Techniques include ZK proofs, TEEs, and selective disclosure.
	- Goal is verifiability with controlled data exposure.
- Interoperability:
	- Bridges, relays, and standards (for example IBC) connect chains.
- Scalability:
	- Rollups, parallel execution, sharding, and modular architectures.


## Part 2: Architecture Visualizations

## Transaction Flow

```text
[User signs transaction]
          -> [Broadcast to P2P mempool]
          -> [Validator selects transactions]
          -> [Block proposal and consensus]
          -> [Block finalization]
          -> [State update]
```

## Part 3: Glossary

- Byzantine Fault Tolerance (BFT):
	- A system property where consensus remains correct despite faulty or malicious nodes.
- Slashing:
	- Economic penalty in PoS for double-signing or protocol violations.
- Data Availability (DA):
	- Assurance that transaction data is published and verifiable by the network.
- Trusted Execution Environment (TEE):
	- Hardware-isolated enclave for confidential computation.
- Account Abstraction (AA):
	- Smart account model enabling custom signature logic, gas abstraction, and policy controls.

next step: [eth](/ethereum/eth/)