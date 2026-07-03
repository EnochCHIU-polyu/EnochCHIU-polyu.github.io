---
title: Ethereum Overview
description: A guide to Ethereum accounts, gas, and proof-of-stake fundamentals.
---

## Part 1: Ethereum as a Shared Execution System

**Ethereum is a decentralized execution system where execution clients deterministically compute state transitions, and consensus clients apply fork-choice and finality rules to select canonical history.**

- **State** = current Ethereum data (account balances, nonces, contract storage)
- **State transition** = deterministic post-state after full execution payload processing (transactions plus protocol-defined block processing)
- Deterministic execution = same pre-state + same payload produces the same post-state on every honest execution client

## Part 2: Foundational Pillars

### 1. Ethereum protocol components

- Execution layer (EL): transaction gossip, mempool, execution payload construction, EVM execution
- Consensus layer (CL): proposer/attester duties, fork-choice, justification/finalization
- Transactions: signed state-transition messages
- Consensus objects: beacon blocks, slots, and checkpoints
- Execution objects: execution payloads embedded in beacon blocks
- Incentives: issuance, base-fee burn, priority fees, and penalties/slashing rules

### 2. Proof-of-Stake (PoS)

- Validators stake ETH and participate in proposal and attestation duties.
- Fork-choice selects the head block from weighted attestations.
- Finality is checkpoint-based (justified/finalized) under supermajority voting assumptions.
- PoS replaced PoW mining on Ethereum mainnet in 2022.
  
### 3. Ethereum Virtual Machine (EVM) - State Machine

- The EVM is Ethereum's execution runtime.
- Execution clients re-execute transactions in execution payloads to validate proposed state transitions.
- Valid payload execution updates account state roots deterministically.

### 4. Smart Contracts

- Smart contracts are on-chain programs.
- They execute according to code and network rules.
- They enable DeFi, tokens, DAOs, identity workflows, and many other dApps.
- Security is critical because contract bugs can be financially exploitable.

### 5. Clients

Ethereum runs as two coordinated client stacks:

- Execution clients (for example Geth, Nethermind, Erigon, Besu) execute EVM transactions and maintain EL state.
- Consensus clients (for example Lighthouse, Prysm, Teku, Nimbus, Lodestar) run PoS fork-choice and finality logic.

Operators combine one EL client and one CL client to run a full post-Merge node.
[Ethereum for Go developers](https://ethereum.org/developers/docs/programming-languages/golang/)

### 6. Turing Completeness

Ethereum's EVM is considered Turing-complete in the theoretical sense because it supports conditional branching and unbounded computation in principle.

- **Conditional branching**: JUMPI enables branch-dependent control flow.
- **Looping**: JUMP/JUMPI plus comparisons can implement loops.
- **Storage (persistent state)**: SSTORE/SLOAD modify/read contract storage committed to global state.
- **Memory (ephemeral per call)**: MSTORE/MLOAD modify/read transient memory for the current execution context.

*Gas bounds execution in practice: without gas, the network could not safely cap runtime for potentially non-terminating programs.*

## Part 3: Quick Comparison (Bitcoin vs Ethereum)

| Dimension               | Bitcoin                  | Ethereum                              |
| ----------------------- | ------------------------ | ------------------------------------- |
| Primary goal            | Digital money settlement | Programmable blockchain platform      |
| Execution model         | Limited scripting        | General-purpose smart contracts (EVM) |
| Native asset            | BTC                      | ETH                                   |
| Mainnet consensus today | PoW                      | PoS                                   |



### Step-by-Step Reading Map

| Step | What Happens                                                   | Read This File                                          |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------- |
| 1    | Node roles, client architecture, and deployment basics         | [eth-node](/ethereum/eth-node/)                         |
| 2    | Peer discovery, gossip, and propagation in the network         | [eth-p2p](/ethereum/eth-p2p/)                           |
| 3    | Cryptographic primitives, signatures, and verification model   | [eth-cryptography](/ethereum/eth-cryptography/)         |
| 4    | User identity and account model (EOA/contract)                 | [eth-account](/ethereum/eth-account/)                   |
| 5    | Wallet models, custody, and account abstraction mental model   | [eth-wallet](/ethereum/eth-wallet/)                     |
| 6    | Hands-on EOA keystore and local-signing workflow (Python)      | [eth-wallet-diy](/ethereum/eth-wallet-diy/)             |
| 7    | Transaction fields (`nonce`, `to`, `value`, `data`, signature) | [eth-transaction](/ethereum/eth-transaction/)           |
| 8    | Fee setup (`gasLimit`, `maxFeePerGas`, `maxPriorityFeePerGas`) | [eth-gas](/ethereum/eth-gas/)                           |
| 9    | CL proposer/attester roles, fork-choice, and finality checkpoints | [eth-pos](/ethereum/eth-pos/)                        |
| 10   | EL runtime execution path and block import re-validation       | [eth-transaction-code](/ethereum/eth-transaction-code/) |


