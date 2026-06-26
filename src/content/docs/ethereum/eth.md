---
title: Ethereum Overview
description: A guide to Ethereum accounts, gas, and proof-of-stake fundamentals.
---
Ethereum is a decentralized, open-source blockchain, best understood as a globally distributed programmable state machine.

## Part 1: What Ethereum Is

- Bitcoin focuses primarily on peer-to-peer digital money.
- Ethereum extends blockchain into general-purpose computation.
- Developers can deploy decentralized applications (dApps) using smart contracts.

## Part 2: Foundational Pillars

## 1. Ethereum Virtual Machine (EVM)

- The EVM is Ethereum's execution runtime.
- Every full node executes EVM rules to stay in consensus.
- Transactions and contract calls produce deterministic state transitions.

## 2. Smart Contracts

- Smart contracts are on-chain programs.
- They execute according to code and network rules.
- They enable DeFi, tokens, DAOs, identity workflows, and many other dApps.
- Security is critical because contract bugs can be financially exploitable.

## 3. Ether (ETH) and Gas
- ETH:
	- Native asset used for value transfer and economic security.
- Gas:
	- Meter for computation and storage usage.
	- Prevents spam and infinite-loop abuse by charging for resource consumption.

## 4. Proof-of-Stake (PoS)

- Validators stake ETH and participate in block proposal and attestation.
- Consensus is achieved by validator votes and finality rules.
- PoS replaced PoW mining on Ethereum mainnet.

## Part 3: Quick Comparison (Bitcoin vs Ethereum)

| Dimension               | Bitcoin                  | Ethereum                              |
| ----------------------- | ------------------------ | ------------------------------------- |
| Primary goal            | Digital money settlement | Programmable blockchain platform      |
| Execution model         | Limited scripting        | General-purpose smart contracts (EVM) |
| Native asset            | BTC                      | ETH                                   |
| Mainnet consensus today | PoW                      | PoS                                   |



### Step-by-Step Reading Map

| Step | What Happens                                                   | Read This File                                                                                         |
| ---- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1    | User identity and account model (EOA/contract)                 | [eth-account](/ethereum/eth-account/)                                                                  |
| 2    | Transaction fields (`nonce`, `to`, `value`, `data`, signature) | [eth-transaction](/ethereum/eth-transaction/)                                                          |
| 3    | Fee setup (`gasLimit`, `maxFeePerGas`, `maxPriorityFeePerGas`) | [eth-gas](/ethereum/eth-gas/)                                                                          |
| 4    | Proposer/validator roles and assignment logic (RANDAO)         | [eth-pos](/ethereum/eth-pos/)                                                                          |
| 5    | Runtime execution path and block import re-validation          | [eth-transaction-code](/ethereum/eth-transaction-code/)                                                |


