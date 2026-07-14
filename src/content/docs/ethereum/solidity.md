---
title: Solidity
description: A strategic guide to Solidity development, covering architecture, data structures, and security patterns for enterprise dApps.
---

Solidity is the primary high-level language for developing smart contracts on the Ethereum Virtual Machine (EVM). From a technical strategy perspective, Solidity isn't just a programming language; it is a tool for defining **deterministic business logic** in a trustless environment.

## Architectural Fundamentals

Solidity is contract-oriented and statically typed. Its execution environment—the EVM—imposes unique constraints, particularly regarding **Gas optimization** and **Persistence**.

### Key Characteristics
- **Deterministic Execution**: Every node in the network must arrive at the same state transition.
- **Gas Awareness**: Every operation carries a cost. Efficient code reduces operational overhead (OpEx) for users.
- **EVM Target**: Compiles down to low-level bytecode executed by the global network of nodes.
- **Inheritance & Polymorphism**: Supports modular design patterns through interfaces and multiple inheritance.

## Data Structures & Storage Strategy

Choosing the right data location is critical for both performance and cost.

| Category | Type | Description | Data Location | Strategic Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Value Types** | `uint256` / `int` | 256-bit integers. | Stack / Memory | Financial balances, counters. |
| | `address` | 20-byte account ID. | Stack / Memory | Identifying owners or contracts. |
| | `bool` | `true` or `false`. | Stack / Memory | Status flags, logic gates. |
| | `enum` | Discrete states. | Stack / Memory | State machines (e.g. Open/Closed). |
| **Reference Types**| `mapping` | Key-value hash map. | Storage | Large-scale lookups (Balances). |
| | `struct` | Custom groupings. | Storage/Mem | Entities (e.g. Asset details). |
| | `array` | Fixed/Dynamic lists. | Storage/Mem | Iteration or ordered data. |
| | `string` / `bytes`| Dynamic byte arrays. | Storage/Mem | UTF-8 text or raw data. |

> **Strategy Note:** Minimize `Storage` writes. Writing to the blockchain state is the most expensive operation in the EVM. Use `Memory` for intermediate calculations.

---

## Modifiers & Access Control

Modifiers are used to change the behavior of functions in a declarative way. They are essential for security and validating pre-conditions.

### Basic Modifier
The `_` (underscore) symbol tells the compiler to execute the rest of the function body.

```solidity
modifier onlyEven(uint256 _val) {
    require(_val % 2 == 0, "Not an even number");
    _; // Main function body runs here
}
```

### Access Control with OpenZeppelin
In production, we use industry-standard libraries like **OpenZeppelin** to handle security. The `Ownable` contract provides basic authorization via the `onlyOwner` modifier.

```solidity
import "@openzeppelin/contracts/access/Ownable.md";

contract SecureVault is Ownable {
    constructor() Ownable(msg.sender) {}

    // The 'onlyOwner' modifier restricts access to the admin
    function emergencyShutdown() public onlyOwner {
        // ... logic
    }
}
```

### Role-Based Access Control (RBAC)
For enterprise solutions, `AccessControl` allows for multiple roles (e.g., Admin, Auditor, Minter).

```solidity
import "@openzeppelin/contracts/access/AccessControl.md";

contract ManagedContract is AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mint() public onlyRole(MINTER_ROLE) {
        // ... execution logic
    }
}
```

---

## Standard Implementations (ERC)

### 1. ERC-20: Fungible Tokens
Used for currency, reputation points, or voting power.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Fixed the extensions from .md to .sol
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProjectToken is ERC20, Ownable {
    // The constructor mints the initial supply to whoever deploys the contract
    constructor(uint256 initialSupply) ERC20("ProjectToken", "PTK") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }

    // This allows YOU (the owner) to mint more tokens later if needed
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### 2. ERC-721: Non-Fungible Tokens (NFTs)
Used for unique assets such as land parcels, certificates, or IoT device identities.

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.md";

contract AssetRegistry is ERC721 {
    uint256 private _nextTokenId;

    constructor() ERC721("ProjectAsset", "PAS") {}

    function registerAsset(address to) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
```

---

## Advanced Logic: The Escrow Pattern
State machines are used to manage complex multi-step processes securely.

```solidity
contract SimpleEscrow {
    enum State { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETE }
    
    address public buyer;
    address public seller;
    State public currState;

    modifier onlyBuyer() { require(msg.sender == buyer); _; }
    modifier inState(State _state) { require(currState == _state); _; }

    constructor(address _seller) payable {
        buyer = msg.sender;
        seller = _seller;
        currState = State.AWAITING_PAYMENT;
    }

    function confirmDelivery() external onlyBuyer inState(State.AWAITING_DELIVERY) {
        currState = State.COMPLETE;
        payable(seller).transfer(address(this).balance);
    }
}
```

---

## Technical Consultant's Corner

### Security Checklist
1.  **Reentrancy**: Use OpenZeppelin's `nonReentrant` modifier.
2.  **Checks-Effects-Interactions**: Update state before making external calls.
3.  **Visibility**: Mark functions as `external` to save gas.
4.  **Pull over Push**: Let users withdraw funds rather than auto-sending to prevent DoS.

