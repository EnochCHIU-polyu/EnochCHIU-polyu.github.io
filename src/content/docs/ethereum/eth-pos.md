---
title: Proof of Stake
description: A guide to Ethereum validator duties, consensus, and staking fundamentals.
---

This note covers PoS from first principles to Ethereum's post-Merge implementation, including validator onboarding, randomness, voting/finality, slashing, and alternative selection models.

## Part 1: Introduction to Proof of Stake

### 1. Why PoS Exists

PoS was introduced to reduce the high energy cost of Proof of Work (PoW), where miners compete with hardware and electricity.

### 2. Core Concept

Instead of selecting block producers by computational work, PoS selects participants based on stake and protocol randomness.

### 3. Terminology

- In PoS literature, blocks may be described as forged or minted (rather than mined).
- Participants are validators (also called forgers in some networks).
- Ethereum terminology primarily uses proposer and validator/attester roles; "mining" is not used post-Merge.

## Part 2: Ethereum Beacon Chain and Validator Onboarding

### 1. Beacon Chain Role

- The Consensus Layer (Beacon Chain logic) coordinates validator registry, committees, attestations, and finality.
- Execution of smart contracts and user transactions remains in the Execution Layer.

### 2. Becoming a Validator

- A participant deposits **at least 32 ETH** to activate a validator identity.
- Deposit data includes BLS public key material and withdrawal credentials.
- After deposit recognition, the validator moves through queue states before becoming active.

Important clarification:

- Holding **32 ETH** in a wallet does **not** automatically convert that wallet into a validator.
- A validator is created only after explicit key-generation and deposit-contract onboarding steps are completed.

Manual activation workflow for the native 32 ETH path:

1. **Prepare hardware and clients.** Set up a machine suitable for continuous operation, then install and sync one execution client and one consensus client. A common operator baseline example is fast NVMe storage, sufficient RAM, and stable broadband, but exact hardware guidance should be taken from current staking guides.
2. **Generate validator credentials.** Use the staking deposit tooling to generate validator key material and withdrawal credentials. Keep recovery material and withdrawal control separated from day-to-day online operations.
3. **Load signing keys into validator operations.** Import validator signing keys into your validator client or remote signer, and enable slashing protection.
4. **Submit deposit data and deposit transaction.** Upload `deposit_data` through the **Launchpad-guided** flow and send the one-way deposit transaction on Ethereum mainnet to the official deposit contract.
5. **Wait for activation and operate continuously.** After recognition, the validator enters queue-based activation, then becomes eligible for duties only when active.

Post-Pectra (Prague-Electra) note:

- Via **EIP-7251 (MaxEB)**, validator effective balance can scale above 32 ETH up to **2,048 ETH**.
- This enables stake consolidation and consensus-layer reward compounding within the expanded effective-balance range.

### 3. Lifecycle (Simplified)

- Deposited: deposit accepted and queued for activation pipeline.
- Pending: waiting for activation based on churn limits and network conditions.
- Active: assigned committees and eligible for **proposing/attesting**.

Operational notes:

- Queue waiting time is dynamic and can vary significantly with validator churn.
- Via **EIP-6110**, deposit data is sourced from execution-layer blocks, reducing deposit processing latency before activation-queue effects.
- Via **EIP-7002** (on networks where activated), execution-layer triggered withdrawal/exit flows are supported, reducing dependence on operator-pre-signed exit coordination.

## Part 2A: Full Node vs Validator

### 1. Different Roles in the Stack

A validator is not the same thing as a full node.

- A full Ethereum PoS stack usually includes an **execution client (EL)** that verifies transactions, executes EVM payloads, maintains execution state, and validates execution-layer data.
- The same stack also includes a **consensus client (CL)** that tracks beacon-chain state, fork choice, committees, attestations, finality, and beacon-block validity.
- A **validator client (VC)** is the component that holds validator signing keys and performs validator duties such as block proposals, attestations, and sync-committee messages when applicable.

### 2. What the Validator Depends On

It is misleading to describe a validator as a signer that operates independently of node software.

- Validators do **not** directly execute execution-layer transactions by themselves.
- However, validator duties depend on EL and CL software that is continuously validating execution payloads, validating beacon blocks, tracking the current fork-choice head, computing duty schedules, and preparing the exact data the validator client is allowed to sign.

In practice, validator signatures are meaningful only because the surrounding node stack has already validated enough state to make that duty current and valid.

### 3. Private Key Isolation

Operationally, key separation matters.

- The **validator signing key** is a hot key used for recurring consensus duties.
- The **withdrawal credential** is logically distinct and should be protected more conservatively.
- Many operators isolate signing through a separate validator client, a remote signer, hardware-backed signing, and strict slashing-protection databases with controlled failover.

The core safety goal is to avoid the same validator key signing conflicting duties from multiple active instances.

### 4. One Infrastructure Stack, Many Validators

A validator is an on-chain identity, not a requirement for a dedicated EL/CL pair.

- One execution client and one consensus client can support **many validator keys**.
- Larger operators often run shared EL/CL infrastructure, one or more validator clients, external signing services, and redundant node paths with careful failover logic.

What must be controlled is not "one node per validator" but:

- key custody;
- slashing protection;
- consistency of chain view during failover;
- safe duty handoff between active and standby systems.

## Part 2B: Participation Paths by Stake Size

### 1. Less Than 32 ETH

A balance below **32 ETH** cannot directly activate a native validator index because the protocol minimum activation balance remains **32 ETH**.

For a dedicated comparison of liquid staking, exchange staking, and reduced-bond operator models, see [Staking with Less Than 32 ETH](/ethereum/eth-stakepooling/).

Common participation paths:

- **Pooled staking** combines capital from multiple users so an operator or protocol can run validators. Tradeoff: lower capital barrier, but additional trust, governance, or smart-contract assumptions.
- **Liquid staking** issues a tokenized claim on staked ETH plus accrued rewards. Tradeoff: adds smart-contract risk, liquidity-token market risk, and possible validator-set concentration risk.
- **Custodial or delegated staking** lets an exchange or service stake on the user's behalf. Tradeoff: simplest user experience, but weaker self-custody and greater counterparty dependence.

### 2. Exactly 32 ETH

At **32 ETH**, a user can operate one validator directly.

Main participation models:

- **Solo staking** means the staker runs their own EL, CL, and validator setup. Tradeoff: highest operational responsibility, but strongest control and cleanest trust model.
- **Staking-as-a-service / delegated operation** means the staker funds the validator but outsources some or all infrastructure operations. Tradeoff: lower operational burden, but added operator trust and dependency.
- **Custodial arrangements** mean a provider controls more of the key or infrastructure stack. Tradeoff: easier access, but weaker self-custody and larger counterparty exposure.

In practice, the critical questions are who controls:

- signing keys;
- withdrawal credentials;
- exit coordination;
- recovery during outages or key loss.

### 3. More Than 32 ETH

For balances above **32 ETH**, the participation model depends on protocol era and operator goals.

Pre-Pectra intuition:

- Additional stake was usually split into multiple **32 ETH validator indices**.
- Example: 64 ETH -> 2 validators; 96 ETH -> 3 validators.

Post-Pectra / **EIP-7251** nuance:

- The old "every additional 32 ETH means one more validator" model is no longer the only native pattern.
- Effective balance can scale above 32 ETH, up to the protocol maximum, allowing larger effective balances per validator, reward compounding within the expanded effective-balance range, and consolidation of multiple validator positions into fewer validator indices where supported.

Tradeoffs for larger positions:

- **More validator indices** provide finer operational granularity, but require more keys, more duties, and more signing overhead.
- **Fewer, larger validator balances** reduce validator-count overhead and can simplify fleet management, but change the concentration and operational-risk profile per validator index.

### 4. Practical Trust and Operations Summary

- **Solo staking** offers the lowest trust in third parties, but the highest operational responsibility.
- **Non-custodial pooled or liquid systems** lower the capital barrier, but add smart-contract, governance, and concentration risks.
- **Delegated or staking-as-a-service models** improve convenience for 32 ETH holders, but shift trust toward the operator's uptime, security, and signing discipline.
- **Custodial exchange staking** has the lowest operational burden, but the highest counterparty and custody dependence.

## Part 2C: What 32 ETH Actually Means in Practice

### 1. Holding 32 ETH Does Not Automatically Make You a Validator

A common misunderstanding is that simply holding **32 ETH** in a wallet means you are already staking or that Ethereum will somehow recognize you as a validator automatically.

That is not how Ethereum works.

At the protocol level, native staking begins when a participant explicitly deposits ETH to activate validator software. Merely owning **32 ETH** in an address does not create a validator index, does not enroll that balance into committee assignments, and does not cause the network to assign proposer or attester duties.

To become a native validator, a participant must complete an explicit onboarding flow:

1. Prepare validator credentials.
2. Generate validator keys and withdrawal credentials.
3. Create valid deposit data.
4. Send a one-way ETH transaction on Ethereum mainnet to the official deposit contract.
5. Run, or arrange the operation of, the validator software stack that will perform duties after activation.
6. Wait for deposit recognition and the activation queue before the validator becomes active.

The practical boundary is:

- Holding **32 ETH** is a capital prerequisite.
- Depositing **32 ETH** to the deposit contract is the protocol enrollment step.
- Running validator infrastructure is what allows that enrolled validator to actually perform consensus duties.

### 2. What a Solo Validator Actually Requires

For solo staking, a validator is not just a wallet balance and not just a signing process.

A practical solo-staking setup normally includes:

- an **execution layer client (EL)** that follows and validates the execution chain;
- a **consensus layer client (CL)** that follows beacon-chain state, fork choice, committees, and finality;
- a **validator client (VC)** that performs duties for the validator keys;
- a machine that stays online reliably enough to keep these components synchronized and ready for duty;
- ongoing monitoring and maintenance so the node remains healthy over time.

Direct staking is therefore an operational role, not a passive wallet state.

A careful operator usually prepares the stack in this order:

1. Choose an execution client and a consensus client.
2. Set up hardware with sufficient headroom for continuous operation.
3. Sync the EL and CL clients.
4. Generate validator keys and withdrawal credentials.
5. Load the validator signing key into the validator client, or into a remote-signing arrangement if used.
6. Verify the withdrawal destination carefully.
7. Submit the deposit transaction to the mainnet deposit contract.
8. Monitor the node while waiting for activation.

This is why ethereum.org describes solo staking as requiring an EL client, a CL client, key generation, loading keys into a validator client, and then monitoring and maintaining the node.

### 3. Key Separation Matters

Ethereum validator setup involves more than one key role, and mixing them up creates real risk.

A conservative mental model is:

- the **validator signing key** is an online operational key used repeatedly for attestations, block proposals, and other consensus messages;
- the **withdrawal credential** identifies where withdrawals can ultimately be directed and should usually be protected more conservatively than the hot signing path.

This distinction matters because the validator must sign frequently, but the withdrawal path should not need routine online exposure.

Operationally, many stakers try to keep these responsibilities separate:

- the validator signing key is loaded into the validator client or signing service;
- the withdrawal destination is checked carefully before deposit;
- recovery material and backups are stored offline or otherwise protected with stronger controls;
- the same validator signing key is never allowed to run from two active instances at once.

That last point is especially important. Duplicate active signing for the same validator can create slashable conflicts.

### 4. Hardware and Software Requirements Are Real

The **32 ETH** threshold is only the financial threshold. It is not the complete validator requirement.

A direct validator also needs functioning infrastructure:

- a dedicated or otherwise reliable machine is strongly preferred;
- persistent storage must be fast enough for client databases and ongoing chain growth;
- internet connectivity must be stable enough for continuous sync and timely duties;
- the software stack must be updated, monitored, and recovered safely after failures;
- the operator must be able to respond to outages, disk issues, client bugs, and configuration mistakes.

Ethereum does not require enterprise hardware for home staking, but it does require a serious always-on system design. Exact hardware recommendations change over time, so it is safer to cite current operational guides than to hard-code numbers in the article.

A useful clarification for readers is that running a node and running a validator are related but different:

- anyone can run a node without staking;
- a validator depends on node software;
- a validator without a healthy EL and CL stack is not a complete working staking setup.

### 5. Deposit Flow: How a Validator Is Actually Created

The Launchpad exists to guide this onboarding flow because becoming a validator is an explicit protocol action.

In simplified form, the native deposit flow is:

1. The staker generates validator credentials and deposit data.
2. The deposit data contains the validator public key, withdrawal credentials, signature material, and the amount to be deposited.
3. The staker sends ETH on Ethereum mainnet to the official deposit contract.
4. That deposit transaction is one-way. It is not a normal reversible application action and does not itself withdraw back out of the deposit contract on demand.
5. The consensus layer later recognizes the deposit information and adds the validator to the onboarding pipeline.
6. The validator then waits through activation mechanics before it can begin duties.

The important boundary is that the deposit transaction happens on the mainnet execution layer, while validator activation and duty scheduling happen on the consensus layer.

That separation helps explain why "I have 32 ETH in my wallet" and "I am an active validator" are very different states.

### 6. Deposit Does Not Mean Immediate Activation

Even after a correct deposit, a validator does not become active instantly.

A newly deposited validator typically passes through at least three practical stages:

- deposit submitted and recognized;
- queued for activation;
- active and eligible for duties.

The waiting period exists because Ethereum limits how quickly validators can enter and leave the active set. This activation queue helps the network absorb validator-set changes in a controlled way rather than instantly.

So the full story is:

- wallet balance alone does nothing at the validator-registry level;
- deposit creates the path into the validator set;
- queue mechanics delay activation when necessary;
- only after activation does the validator begin proposer and attester duties.

This also means the software stack should be ready before the validator reaches active status. If the validator becomes active while the node is not healthy, it can miss duties and underperform immediately.

### 7. Operational Variants at the 32 ETH Threshold

A user with **32 ETH** has more than one way to reach staking exposure, but the trust and operating model changes materially across those paths.

| Path | Who runs the infrastructure? | Who usually controls the validator signing path? | Who usually retains the stronger claim over withdrawals? | Main tradeoff |
| --- | --- | --- | --- | --- |
| Solo staking | The staker | The staker | The staker | Lowest third-party trust, highest operational responsibility |
| Staking as a service | A third-party operator | Often the operator after the staker uploads signing credentials or grants signing access | Often the staker retains the withdrawal side, but provider design varies | Keeps a native 32 ETH validator structure while outsourcing operations, but adds operator trust |
| Pooled staking | A protocol-selected or provider-selected operator set | Usually not the end user | Usually governed by protocol contracts, pool design, or provider rules rather than a dedicated personal validator setup | Lower capital barrier and easier access, but adds smart-contract, governance, and concentration risk |
| Centralized exchange staking | The exchange or its delegates | The exchange | The exchange or the exchange-controlled withdrawal process | Simplest user experience, but highest custody and counterparty dependence |

A useful summary is:

- solo staking is the clearest "my validator, my operations" model;
- staking as a service keeps the 32 ETH validator threshold but outsources operations;
- pooled staking lowers the capital threshold by adding coordination layers above the protocol;
- exchange staking usually gives the user an account-level claim, not direct validator-level control.

### 8. Practical Reading of the 32 ETH Rule

The simplest accurate sentence for readers is:

Owning **32 ETH** gives you the option to onboard a native validator, but it does not make you a validator until you complete the deposit flow and have validator infrastructure ready to operate.

That framing avoids two common errors:

- treating staking as if it were an automatic wallet yield;
- treating validator operation as if it were only a deposit action with no ongoing system responsibility.

For Ethereum, both sides matter:

- capital must be committed through the deposit contract;
- software must be prepared to carry out consensus duties after activation.

## Part 3: Overview

![overview](../../../assets/eth-pos-overview.png)

## Part 4: Committees and RANDAO

![alt text](../../../assets/pos_detail.png)

### 1. Committees
- Active validators are pseudo-randomly shuffled using protocol randomness (RANDAO-based inputs).
- For each slot, **one proposer** is selected.
- Validators are shuffled into committees for attestation duties.
- During an epoch, active validators are assigned to committees by protocol randomness.
- Ethereum defines a target committee size (commonly referenced as 128), but realized committee sizes can vary with active validator count and protocol limits.

#### Committee Count Restriction Formula

The actual number of committees per slot is dynamically computed from the active validator set.

In study form:

$$
	ext{CommitteesPerSlot} = \max\left(1,\min\left(64,\left\lfloor\frac{\text{ActiveValidators}}{32 \times 128}\right\rfloor\right)\right)
$$

Equivalent protocol-style form:

$$
	ext{CommitteesPerSlot} = \max\left(1,\min\left(\text{MAX\_COMMITTEES\_PER\_SLOT},\frac{\text{ActiveValidators}}{\text{SLOTS\_PER\_EPOCH}\times\text{TARGET\_COMMITTEE\_SIZE}}\right)\right)
$$

where the division is integer division under protocol rules.

#### Calculation Logic for Committee Size

When active validators exceed 262,144, committees per slot reach the protocol cap of 64:

$$
32 \times 128 \times 64 = 262,144
$$

After this point, committee count no longer increases; additional validators are spread across existing committees.

1. Total committees per epoch at cap:

$$
32\ \text{slots} \times 64\ \text{committees/slot} = 2,048\ \text{committees/epoch}
$$

2. Validators are pseudo-randomly distributed across these epoch committees so each active validator receives attestation duties according to its assignment.

#### Simulation Examples

Approximate average committee size can be estimated as:

$$
	ext{AvgCommitteeSize} \approx \frac{\text{ActiveValidators}}{2,048}
$$

- With about 900,000 active validators:

$$
\frac{900,000}{2,048} \approx 439
$$

- With about 1,000,000 active validators:

$$
\frac{1,000,000}{2,048} \approx 488
$$

These are averages; realized committee sizes vary slightly because assignment is discrete and randomized.



### 2. RANDAO Randomness Pipeline

- Proposers include a `randao_reveal` in blocks.
- Reveals are mixed into the protocol randomness accumulator.
- The resulting randomness is used to assign future proposers and committees.

Why this matters:
- Reduces duty predictability.
- Improves fairness of assignments.
- Raises the difficulty of targeted manipulation.

## Part 5: Proposal, Voting, and BLS Aggregation

### 1. Block Proposal

- For each slot, one proposer is randomly selected.
- In modern Ethereum operations, out-of-protocol proposer-builder separation ecosystems can provide payloads, while the proposer still publishes the beacon block.

### 2. Attestation Voting

- Committee validators attest to block correctness and fork-choice head.
- Safety thresholds are stake-weighted, not simple validator counts.
- Finality logic relies on supermajority voting behavior over checkpoints.

At the slot level, one validator proposes a block and the committee votes by submitting attestations. A typical attestation includes:

- The attestation `slot` and `committee index`.
- The `beacon_block_root` for the head being voted.
- The **target** checkpoint (current epoch checkpoint vote).
- The **source** checkpoint (previous justified checkpoint reference).
- The validator's signature proving the vote came from that validator.

### 3. BLS Aggregation

- Individual attestations are compressed via BLS aggregation.
- Aggregation reduces bandwidth and verification overhead.
- This scaling mechanism is essential for large validator sets.

## Part 5A: Slot Timing and Cross-Slot Handoff

### 1. Time Units

Ethereum PoS runs on a fixed clock.

- **1 slot = 12 seconds**
- **1 epoch = 32 slots**
- Therefore, **1 epoch = 384 seconds = 6.4 minutes**

For each slot:

- one proposer is selected;
- committees are assigned to attest;
- some committee members may be selected as aggregators.

### 2. Practical In-Slot Timeline

A useful operator-facing mental model is:

- **0-4 seconds: proposal and propagation.** The proposer for slot `t` should publish the beacon block as early as possible. That block carries the execution payload and any eligible consensus operations available at that time, and peers begin propagating it across the consensus p2p network.
- **4-8 seconds: attestation production.** Committee members receive the block, validate it, update fork choice, and produce attestations. These attestations are gossiped on relevant committee subnets rather than to every validator globally. If a validator does not see a timely valid block for slot `t`, it can still attest to its best available fork-choice head.
- **8-12 seconds: aggregation and next-slot preparation.** Selected aggregators collect committee attestations and produce aggregate attestations. Aggregates are rebroadcast so later proposers can include them efficiently. By the end of the slot, the network is converging on the head that the next proposer will likely build on.

This is an operational timing model, not a claim that all honest nodes receive messages at exactly the same moment.

### 3. How Slot `t+1` Builds on Slot `t`

Slots are not isolated; each slot hands state and information to the next one.

- The proposer of slot `t+1` chooses a parent according to fork choice, which reflects whatever valid block and attestations from slot `t` arrived in time.
- The block in slot `t+1` can include attestations and aggregates produced in or after slot `t`.
- In practice, the **parent choice** for slot `t+1` is strongly influenced by slot-`t` attestations, and the **block body** of slot `t+1` often contains votes about slot `t`.

The chain therefore advances by a repeated pattern:

- propose at slot `t`;
- attest to what was seen in slot `t`;
- aggregate those attestations;
- use that voting information to strengthen fork choice for slot `t+1`.

### 4. Missed and Late Slots

A **missed slot** means no valid beacon block becomes available for that slot.

- There is no new block at that slot number.
- The next proposer builds on the latest valid head from an earlier slot.
- Later attestations can still move fork choice and finality forward if enough stake continues to vote correctly.

A **late slot** is more subtle.

- The block can still be valid.
- But many attesters may already have failed to receive it in time or may have attested to an earlier head.
- Consequences can include fewer timely attestations, weaker immediate fork-choice support, and worse proposer and attester economics for that slot.

### 5. Why Aggregation Timing Matters

Aggregation is not just a bandwidth optimization.

- Individual attestations first spread within committee-specific gossip paths.
- Aggregators compress them into aggregate attestations.
- Later proposers include these aggregates on-chain, which improves fork-choice weight visibility and reward accounting efficiency.

### 6. Proposer Selection Probability

Proposer selection is **stake-weighted through effective balance**, not simply one validator index equals one equal chance.

- Under older simplified explanations, validators were often treated as if they all had the same effective balance cap of **32 ETH**, so proposer odds looked roughly equal per validator index.
- More precisely, proposer selection probability is weighted by a validator's **effective balance** under the active protocol rules.
- Post-Pectra, that simplification is less complete because effective-balance rules are no longer universally pinned to the old 32 ETH cap assumptions.

## Part 6: Security Model, Nothing-at-Stake, and Slashing

### 1. Nothing-at-Stake Risk (Conceptual)

Early PoS discussions highlighted a risk where validators might sign competing forks without physical mining cost.

### 2. Ethereum Mitigation: Slashing

Ethereum penalizes slashable behavior such as:

- Double proposal for the same slot.
- Double vote (conflicting attestations).
- Surround vote patterns.

### 3. Penalty Effects (High Level)

- Forced exit from active duties.
- Initial slash penalties and correlated penalties are protocol-parameterized and can change across hard forks.
- Full withdrawability timing depends on exit queue and withdrawability delay; it is not a single fixed wall-clock constant.

Exact penalty size depends on protocol rules and surrounding slash events.

## Part 7: Rewards and Finality

### 1. Reward Logic

- Rewards are tied to validator effective balance and total active stake.
- Proposer and attester rewards are separate components.
- Additional incentives can exist for including slash evidence.

Common base-reward study formula form:

$$
BaseReward = \frac{EffectiveBalance \times BASE\_REWARD\_FACTOR}{\sqrt{TotalActiveBalance} \times BASE\_REWARDS\_PER\_EPOCH}
$$

On mainnet constants this is commonly expressed as:

$$
BaseReward = \frac{EffectiveBalance \times 64}{\sqrt{TotalActiveBalance} \times 4}
$$

Post-Pectra interpretation:

- `EffectiveBalance` is no longer a universal fixed 32 ETH assumption in all cases.
- Per-validator effective balance can vary (up to MaxEB bounds), so worked examples should explicitly state assumptions.

Reward split intuition:

- Proposer can receive about **1/8** share of attestation-related base reward components they include.
- Attesters can receive up to about **7/8** of base reward-related components when duties are correctly performed.

Note: exact production-client accounting includes additional constants, penalties, and timing factors.

### 2. Worked Reward Example (Study Format)

The following is a simplified exam-style walkthrough using common lecture assumptions.

#### A) Base Reward Example

Assume:

- Active validators = 600,000
- Effective balance per validator (example assumption) = 32 ETH = 32 * 10^9 gwei

Formula:

$$
BaseReward = \frac{EffectiveBalance \times 64}{\sqrt{TotalActiveBalance} \times 4}
$$

With:

$$
TotalActiveBalance = 600,000 \times 32 \times 10^9\ gwei
$$

So a commonly cited simplified result is:

$$
BaseReward \approx 3,695\ gwei
$$

Assumption note: this numeric result depends on the 32 ETH-per-validator simplification and is a study example, not a universal post-Pectra constant.

#### B) Proposer Reward Example

For included valid attestations, a proposer receives approximately:

$$
ProposerShare \approx attestations  \times \frac{1}{8} \times BaseReward
$$

If expected attestations per slot are approximated as:

(Here, `600,000 / 32` uses active validator count per epoch-slot distribution. This is not derived from dividing total active stake by 32 ETH.)

$$
\frac{600,000}{32} = 18,750
$$

Then a simplified estimate is:

$$
ProposerReward \approx 18,750 \times \frac{1}{8} \times 3,695 = 8,660,156\ gwei
$$

Depending on lecture constants/rounding assumptions, you may also see nearby values.

#### C) Attester (Validator) Reward Example

A non-proposer validator performing attestation duties can receive up to approximately:

$$
AttesterReward_{max} \approx \frac{7}{8} \times BaseReward + \frac{priority fee}{validators}
$$

Using the same base reward:

$$
AttesterReward_{max} \approx \frac{7}{8} \times 3,695 + \frac{0.05}{600,000} = 3,233.125\ gwei
$$

#### D) Slashing-Inclusion Reward (Proposer)

If a proposer includes valid slash evidence, a simplified study form is:

$$
SlashingInclusionReward = \frac{SlashedValidatorsEffectiveBalance}{512}
$$

This component is separate from ordinary proposer/attester reward shares.

### 3. Finality

- Finality is achieved through checkpoint justification/finalization across epochs.
- Under normal conditions, economic finality is commonly reached after about **2 epochs (around 12.8 minutes)**.

Algorithms used in Ethereum PoS:

- **Casper FFG:** checkpoint justification/finalization mechanism across epochs.
- **LMD-GHOST:** fork-choice rule used to determine the current chain head before and between finality events.

Engine API coordination note:

- CL fork-choice updates are communicated to EL via Engine API (for example forkchoice-updated flows) so payload building/validation tracks the CL-selected head.

## Part 8: Alternative Selection Model - Coin Age

Some PoS-family systems use coin age to balance pure wealth-based selection.

- Coin age concept: staked amount multiplied by staking duration.
- Representative form:

$$
CoinAge = Coins \times DaysStaked
$$

- Selection probability can be adjusted by coin age (for example, increasing chance with age).
- After successful block signing, coin age may reset.
- Some designs cap effective age to prevent very old stakes from dominating.

## Part 9: Slot-Level PoS Flow

```text
[RANDAO updates randomness]
        -> [Proposer and committees assigned]
        -> [Block proposal in slot]
        -> [Committee attestations]
        -> [Fork choice head update]
        -> [Checkpoint justification/finality across epochs]
```

## Part 10: References

- [Ethereum.org: Staking](https://ethereum.org/en/staking/)
- [Ethereum.org: Solo Staking](https://ethereum.org/en/staking/solo/)
- [Ethereum.org: Run a Node](https://ethereum.org/en/run-a-node/)
- [Ethereum.org: Staking as a Service](https://ethereum.org/en/staking/saas/)
- [Ethereum.org: Pooled Staking](https://ethereum.org/en/staking/pools/)
- [Ethereum Launchpad: Overview](https://launchpad.ethereum.org/en/overview)
- [Ethereum Launchpad: Checklist](https://launchpad.ethereum.org/en/checklist)
- [Ethereum Launchpad: FAQ](https://launchpad.ethereum.org/en/faq)
- [Ethereum.org: Proof-of-Stake](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/)
- [Ethereum.org: Attestations](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/attestations/)
- [Ethereum.org: Slots and Epochs](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/#slots-and-epochs)
- [Ethereum Staking Deposit CLI](https://github.com/ethereum/staking-deposit-cli)
- [Consensus Specs](https://github.com/ethereum/consensus-specs)
- [Annotated Consensus Specs (eth2book)](https://eth2book.info/)
- [EIP-7251: Increase the MAX_EFFECTIVE_BALANCE](https://eips.ethereum.org/EIPS/eip-7251)
- [EIP-6110: Supply Validator Deposits on Chain](https://eips.ethereum.org/EIPS/eip-6110)
- [EIP-7002: Execution Layer Triggerable Withdrawals](https://eips.ethereum.org/EIPS/eip-7002)
