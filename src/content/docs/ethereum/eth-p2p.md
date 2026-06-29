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

Execution clients form one P2P network for transaction gossip and related execution-layer communication.

### 1. Discovery

- New nodes discover peers through bootnodes and node records.
- Discovery is built on UDP because it is lightweight and efficient for initial peer finding.
- Ethereum uses ENRs (Ethereum Node Records) to store a node’s identity and connection information.

### 2. [DevP2P](https://github.com/ethereum/devp2p)

- After discovery, execution clients communicate over the DevP2P stack.
- DevP2P sits on top of TCP and supports authenticated peer sessions.
- The stack includes RLPx transport, wire protocol messaging, and execution sub-protocols.

### 3. Execution sub-protocols

- Transaction gossip moves pending transactions between nodes.
- Clients use this mempool traffic so block builders can select transactions for inclusion.
- Other execution-layer protocols such as snap and les exist to support specific sync and light-client use cases.

## Part 3: Consensus-Layer Networking

Consensus clients form a separate P2P network with their own discovery and gossip rules.

### 1. Discovery and ENRs

- Consensus clients also use discv5 over UDP to find peers.
- Their ENRs include consensus-specific metadata such as the node’s public key, network addresses, and fork/version data.

### 2. libp2p networking

- After discovery, consensus clients communicate over libp2p.
- This stack replaces the older DevP2P-style approach for consensus networking.
- The consensus layer uses libp2p for both gossip and request-response traffic.

### 3. Gossip and request-response

- Gossip is used for beacon blocks, attestations, exits, and slashings.
- Request-response is used when a client needs a specific block, committee data, or another precise response from a peer.
- Responses are encoded efficiently so nodes can verify and process them quickly.

## Part 4: Connecting the Two Clients

Execution and consensus clients run in parallel, but they must coordinate locally.

- The consensus client tells the execution client when it needs to build or validate a block.
- The execution client returns execution payloads and validation data.
- The two clients communicate through a local RPC interface, commonly referred to as the [Engine API](https://github.com/ethereum/execution-apis/blob/main/src/engine/common.md).

This division keeps responsibilities clear:

- Execution clients handle transaction execution and transaction gossip.
- Consensus clients handle block gossip, validator duties, and chain finalization.

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

Ethereum networking is not a single network but two coordinated peer-to-peer systems: one for execution-layer transaction gossip and one for consensus-layer block and validator communication. Discovery, gossip, request-response, and local client-to-client coordination all work together to keep the chain synchronized and secure.

Next step: [eth-cryptography](/ethereum/eth-cryptography/)
