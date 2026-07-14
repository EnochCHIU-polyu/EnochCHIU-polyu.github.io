---
title: Solidity
description: A comprehensive guide to Solidity, the primary programming language for Ethereum smart contracts.
---

Solidity is a high-level, contract-oriented, statically-typed programming language designed for developing smart contracts that run on the Ethereum Virtual Machine (EVM). Influenced by C++, Python, and JavaScript, it is the most widely used language for implementing logic on decentralized applications (dApps).

## What is Solidity?

Solidity is the primary language used to build the logic of the Ethereum network. It allows developers to write self-executing code that governs the behavior of accounts within the Ethereum state. These "smart contracts" can handle anything from simple token transfers (ERC-20) to complex decentralized autonomous organizations (DAOs).

### Key Characteristics

- **Statically Typed**: Every variable's type (e.g., `uint256`, `address`, `bool`) must be specified at compile-time, reducing runtime errors.
- **Contract-Oriented**: The syntax is built around the `contract` keyword, similar to `class` in object-oriented languages, encapsulating data and functions.
- **Inheritance**: Supports multiple inheritance, allowing developers to extend functionality from existing contracts (e.g., OpenZeppelin's standard templates).
- **Libraries**: Enables the creation of reusable code units that can be called by other contracts without being deployed as standalone entities.
- **Complex User-Defined Types**: Supports `structs` and `enums` for organizing complex data structures.

## The Compilation Process

Before a Solidity contract can run on the Ethereum blockchain, it must undergo a compilation process:

1.  **Source Code (`.sol`)**: The human-readable code written by the developer.
2.  **Solidity Compiler (`solc`)**: Translates the source code into two primary outputs:
    -   **Bytecode**: The low-level machine code that the Ethereum Virtual Machine (EVM) executes.
    -   **Application Binary Interface (ABI)**: A JSON-formatted interface that allows external applications (like frontend websites using Ethers.js) to interact with the contract.
3.  **Deployment**: The bytecode is sent to the Ethereum network via a transaction, where it is assigned a permanent address.

## Basic Syntax Example: Simple Storage

Below is a simple example of a "Storage" contract that allows a user to store and retrieve a single number.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // State variable stored on the blockchain
    uint256 private storedData;

    // Event to log data changes
    event DataStored(address indexed user, uint256 value);

    // Function to update the stored data
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(msg.sender, x);
    }

    // Function to retrieve the stored data
    function get() public view returns (uint256) {
        return storedData;
    }
}
```

## Important Concepts

### State Variables
Variables defined at the contract level that are permanently stored in contract storage on the blockchain. Modifying these variables costs "gas."

### Functions
The executable units of code. They can be `public`, `private`, `internal`, or `external`. 
- **View/Pure Functions**: Functions that do not modify the state. `view` reads from state; `pure` does neither read nor write.

### Modifiers
Used to change the behavior of functions in a declarative way, such as checking for authorization (`onlyOwner`) or validating inputs before execution.

### Events
Abstracted logging facilities that allow dApp frontends to "listen" for specific actions occurring on the blockchain.

### Mappings
Key-value stores (hashes) used to store relationships, such as `mapping(address => uint256) balances;` to track token ownership.

## Security and Best Practices

Smart contracts often handle significant financial value, making security paramount.

-   **Checks-Effects-Interactions Pattern**: Always perform checks (requirements) first, then update state (effects), and finally interact with external contracts to prevent **Reentrancy attacks**.
-   **Gas Optimization**: Avoid loops over dynamic arrays or excessive storage operations to keep transaction costs manageable.
-   **Overflow/Underflow**: While Solidity 0.8.x handles this automatically, understanding how integers wrap is crucial for older versions.
-   **Auditing**: Use tools like Slither or Mythril for static analysis, and always seek professional audits for production-grade code.
