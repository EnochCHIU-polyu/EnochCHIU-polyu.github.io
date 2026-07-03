---
title: P2P Network
description: A guide to peer discovery, gossip, and propagation in Ethereum.
---

## Part 1: What the Networking Layer Does

Ethereum is a peer-to-peer network made up of many nodes that must exchange information using standardized protocols. The networking layer is the stack that allows those nodes to find one another, connect securely, and communicate.

At a high level, the networking layer supports two communication patterns:

- Gossip:
	- One node sends data to many peers.
	- Used for fast propagation of transactions, blocks, attestations, and other network-wide data.
- Request-response:
	- One node requests specific data from another node.
	- Used for targeted queries such as syncing state, fetching blocks, or retrieving specific records.

## Part 2: Execution-Layer Networking

Execution clients form an execution-layer (EL) P2P network for transaction and block propagation, plus sync-related request-response traffic.

### 1. Discovery

- New nodes discover peers through bootnodes and node records.
- Discovery is built on UDP because it is lightweight and efficient for initial peer finding.
- Ethereum uses ENRs (Ethereum Node Records) to store a node’s identity and connection information.
- In practice, EL clients commonly support discv4 and/or discv5 discovery, depending on client and configuration.

### 2. [DevP2P](https://github.com/ethereum/devp2p)

- After discovery, execution clients communicate over the DevP2P stack.
- DevP2P sits on top of TCP and supports authenticated peer sessions.
- The stack includes RLPx transport, p2p capability negotiation, and execution sub-protocols such as `eth`.

### 3. Execution sub-protocols

- Transaction gossip moves pending transactions between nodes.
- Block propagation uses announcements plus request-response for block bodies/receipts/state data.
- EL mempool traffic feeds payload construction by proposers/builders, depending on node role and PBS setup.
- `snap` is widely used for state sync; `les` is legacy/deprecated in most modern mainnet setups.

## Part 3: Consensus-Layer Networking

Consensus clients form a separate P2P network with their own discovery and gossip rules.

### 1. Discovery and ENRs

- Consensus clients also use discv5 over UDP to find peers.
- Their ENRs include consensus-specific metadata such as the node’s public key, network addresses, and fork/version data.

### 2. libp2p networking

- After discovery, consensus clients communicate over libp2p.
- This stack replaces the older DevP2P-style approach for consensus networking.
- The consensus layer uses libp2p for both gossip and request-response traffic (for example gossipsub + RPC-style methods).

### 3. Gossip and request-response

- Gossip is used for beacon blocks, attestations, exits, and slashings.
- Request-response is used for targeted retrieval (for example specific blocks, blob sidecars where applicable, and other sync objects).
- Encodings and validation rules are SSZ-based in the beacon stack so peers can verify data deterministically.

## Part 4: Connecting the Two Clients

Execution and consensus clients run in parallel, but they must coordinate locally.

- The consensus client tells the execution client when it needs to build or validate a block.
- The execution client returns execution payloads and validation data.
- The two clients communicate through a local RPC interface, commonly referred to as the [Engine API](https://github.com/ethereum/execution-apis/blob/main/src/engine/common.md).

Core Engine API flow is centered on fork-choice and payload validity:

- CL sends fork-choice updates and payload attributes to EL.
- EL validates submitted payloads and returns payload status, and for build flows returns locally built execution payload data through `getPayload` methods.
- CL uses EL validity results to continue fork-choice and finalization progression.

This division keeps responsibilities clear:

- Execution clients handle transaction execution, EL state, and EL gossip/request-response.
- Consensus clients handle beacon gossip, validator duties, fork-choice, and finalization.

## Part 5: Why This Design Matters

- It separates transaction propagation from consensus propagation.
- It lets each layer use the protocol stack best suited to its job.
- It improves scalability by keeping discovery, gossip, and request-response traffic organized.
- It reduces trust assumptions by requiring authenticated communication between peers and between the two client types.

## Part 6: Operational Notes

- Keep peer diversity high to reduce eclipse risk.
- Keep clocks, ports, and client versions in sync with network requirements.
- Monitor peer count, propagation latency, and connection stability.
- Use the correct discovery and networking settings for the client pair you run.

## Part 7: Summary

Ethereum networking is not a single network but two coordinated peer-to-peer systems: one for EL transaction/block propagation and one for CL beacon/validator communication. Discovery, gossip, request-response, and local EL-CL Engine API coordination work together to keep the chain synchronized and secure.

Next step: [eth-cryptography](/ethereum/eth-cryptography/)
