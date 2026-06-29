---
title: P2P Network
description: A guide to peer discovery, gossip, and propagation in Ethereum.
---

## Part 1: Why P2P Matters

Ethereum does not rely on a central server. Instead, nodes form a peer-to-peer (P2P) overlay network to exchange transactions, blocks, and consensus messages. This decentralized communication layer enables fault tolerance, censorship resistance, and global availability.

## Part 2: Network Layers

Modern Ethereum networking spans two major communication domains:

- Execution layer networking:
	- Handles execution payload propagation and transaction exchange.
	- Uses devp2p protocols for peer communication.
- Consensus layer networking:
	- Handles beacon blocks, attestations, and related consensus objects.
	- Uses libp2p with gossip-based pub-sub topics.

Although separate, both layers must remain aligned for correct head tracking and finality progression.

## Part 3: Core P2P Functions

### 1. Peer Discovery

- Nodes discover each other through discovery protocols and bootnodes.
- Peer scoring and connection policies help maintain healthy peer sets.
- Geographic and client diversity in peers improves resilience.

### 2. Gossip and Propagation

- New transactions and blocks are propagated through gossip.
- Fast propagation reduces orphan risk and improves confirmation experience.
- Nodes validate messages before forwarding, filtering malformed or invalid data.

### 3. Sync and Data Availability

- New nodes synchronize chain data from peers.
- Snapshots and optimized sync modes reduce time to usable state.
- Data availability across many peers helps maintain liveness under churn.

## Part 4: Reliability and Security

- Eclipse resistance:
	- Nodes should avoid over-reliance on a narrow peer set.
	- Peer rotation and diversified inbound and outbound peers reduce isolation risk.
- DoS resilience:
	- Rate limits, validation gates, and bounded resources protect node stability.
	- Invalid or abusive peers can be down-scored or disconnected.
- Network hygiene:
	- Correct clocks, stable connectivity, and updated client versions are essential.

## Part 5: Practical Tuning Guidelines

- Maintain adequate peer counts to avoid fragility.
- Keep ports and firewall rules aligned with client requirements.
- Monitor propagation latency, peer churn, and failed message validation rates.
- Prefer client and region diversity in production infrastructure.

## Part 6: Summary

Ethereum P2P networking is the transport fabric that makes decentralized consensus practical at global scale. Strong peer management and healthy propagation are foundational to reliable node operations.

Next step: [eth-pos](/ethereum/eth-pos/)
