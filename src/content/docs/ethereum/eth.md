---
title: Ethereum Overview
description: A guide to Ethereum accounts, gas, and proof-of-stake fundamentals.
---

## Part 1: Ethereum =“world computer”

**Ethereum is a decentralized computer that anyone can use to run code, and everyone agrees on the result. Because of follow:**

- **State** = current data (balances, contract storage)
- **Transition** = change **State** after transactions
- Deterministic = same input → same output everywhere

## Part 2: Foundational Pillars

### 1. Recall what blockchains have, Ethereum components:

- P2P network → nodes communicate
- Transactions → messages changing state
- Consensus rules
- State machine: processes transactions according to the consensus rules
- Blocks (history)
- Consensus algorithm (PoS)
- Incentives (rewards, gas)

### 2. Proof-of-Stake (PoS)

- Validators stake ETH and participate in block proposal and attestation.
- Consensus is achieved by validator votes and finality rules.
- PoS replaced PoW mining on Ethereum mainnet.
  
### 3. Ethereum Virtual Machine (EVM) - State Machine

- The EVM is Ethereum's execution runtime.
- Every full node executes EVM rules to stay in consensus.
- Transactions and contract calls produce deterministic state transitions.

### 4. Smart Contracts

- Smart contracts are on-chain programs.
- They execute according to code and network rules.
- They enable DeFi, tokens, DAOs, identity workflows, and many other dApps.
- Security is critical because contract bugs can be financially exploitable.

### 5. Clients

Ethereum has several interoperable implementations of its execution and consensus client software, the most prominent of which are go-ethereum (Geth) and Nethermind for execution and Prysm and Lighthouse for consensus.
[Ethereum for Go developers](https://ethereum.org/developers/docs/programming-languages/golang/)

### 6. Turing Completeness

Ethereum (EVM) is Turing-complete because it mirrors a PC's core capabilities on a blockchain:

- **Conditional** Branching: Uses the JUMPI opcode (if/else in Solidity) to change execution based on data.
- Arbitrary **Looping**: Uses JUMP with comparison opcodes (for/while loops) to repeat code indefinitely.
- **Memory Read/Write**: Uses SSTORE/SLOAD and MSTORE/MLOAD to modify global ledger states and temporary variables.

*If no gas mechanism, ethereum can’t predict if a smart contract will terminate or how long it will run without actually running it (possibly running forever).

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
| 3    | User identity and account model (EOA/contract)                 | [eth-account](/ethereum/eth-account/)                   |
| 4    | Transaction fields (`nonce`, `to`, `value`, `data`, signature) | [eth-transaction](/ethereum/eth-transaction/)           |
| 5    | Fee setup (`gasLimit`, `maxFeePerGas`, `maxPriorityFeePerGas`) | [eth-gas](/ethereum/eth-gas/)                           |
| 6    | Proposer/validator roles and assignment logic (RANDAO)         | [eth-pos](/ethereum/eth-pos/)                           |
| 7    | Runtime execution path and block import re-validation          | [eth-transaction-code](/ethereum/eth-transaction-code/) |


