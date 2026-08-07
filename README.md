# ProofVault AI

> **Protecting Digital Creativity Through AI & Blockchain.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Polygon](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)](https://polygon.technology/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Supported-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

**ProofVault AI** is a production-grade multi-modal digital asset protection ecosystem that unifies Web Crypto SHA-256/SHA-3/BLAKE3 hashing, neural AI perceptual fingerprinting (2D-DCT + OpenAI CLIP), decentralized IPFS storage, and Polygon blockchain smart contracts. Designed for creators, software developers, research scientists, and enterprises, ProofVault AI establishes immutable proof-of-registration and instant anti-piracy verification.

---

## 📋 Table of Contents

1. [Introduction](#3-introduction)
2. [Problem Statement](#4-problem-statement)
3. [Solution](#5-solution)
4. [Key Features](#6-key-features)
5. [Architecture](#8-architecture)
6. [Technology Stack](#9-technology-stack)
7. [Smart Contracts](#14-smart-contracts)
8. [Legal Notice](#legal-notice)

---

## 3. Introduction

### What is ProofVault AI?
ProofVault AI is a decentralized intellectual property (IP) verification platform. It creates permanent, tamper-proof proof-of-existence and cryptographic ownership evidence for digital assets—including artwork, codebase repositories, research papers, music tracks, vector graphics, and media documents.

### Why Was It Built?
In the modern generative AI era, digital assets are duplicated and manipulated within seconds. ProofVault AI provides borderless, instant, and mathematically verifiable IP registration.

---

## 5. Solution

- ⛓️ **Blockchain Anchoring (Polygon)**: Smart contracts record asset hashes, owner wallet addresses, and timestamps in unalterable block transactions with commit-reveal anti-frontrunning protection.
- 🧠 **Perceptual Neural AI (FastAPI + CLIP + 2D-DCT)**: Transforms images and text into normalized vector embeddings and 2D-DCT perceptual hashes for nearest-neighbor similarity detection.
- 📦 **Decentralized IPFS Storage (Pinata)**: Off-chain asset metadata standard and encrypted representations are pinned to IPFS.
- 🔐 **ERC-721 Proof NFTs & Licensing**: Creators can optionally mint 1-to-1 unique proof-of-ownership NFTs and set automated multi-tier licensing terms (Personal, Commercial, Exclusive) with pull-withdrawal payout protection.

---

## 9. Technology Stack

| Layer | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 16.3.0 | Server & Client components, App Router, SSR. |
| **User Interface** | React + TailwindCSS | 19.2 / 4.0 | Glassmorphic design system and responsive UI. |
| **Cryptography** | Web Crypto & @noble/hashes | FIPS 202 | SHA-256, SHA3-256, BLAKE3, and 2D-DCT pHash. |
| **Web3 Wallet Library** | Ethers.js | 6.17.0 | Web3 provider for MetaMask interaction and smart contract encoding. |
| **AI Inference API** | FastAPI | 0.111.0 | Asynchronous Python REST microservice. |
| **Neural AI Models** | OpenAI CLIP & HuggingFace | PyTorch 2.3 | Vision-language multi-modal embedding generation. |
| **Vector Search Engine**| Meta FAISS | 1.8.0 | Inner-product vector indexing for fast similarity lookup. |
| **Smart Contracts** | Solidity | 0.8.24 | OpenZeppelin Ownable, ReentrancyGuard, ERC721URIStorage. |
| **Database** | MongoDB & Mongoose | 9.9.1 | Asset metadata and verification audit logs. |
| **Decentralized Storage**| Pinata IPFS SDK | 0.5.4 | Enterprise pinning services for immutable storage. |

---

## 14. Smart Contracts

1. **`OwnershipRegistry.sol`**: Manages immutable proof hashes with commit-reveal timelocks (`MIN_COMMITMENT_AGE = 2` blocks) and replay defense.
2. **`Licensing.sol`**: Multi-tier licensing terms with initialization guards, automatic overpayment refunds, and reentrancy-guarded pull withdrawals.
3. **`ProofNFT.sol`**: ERC-721 token bound to registered hashes, enforcing strict 1-to-1 uniqueness per asset hash.

---

## Legal Notice

> **Legal Disclaimer**: *Blockchain provides immutable proof of registration and ownership evidence. ProofVault AI provides decentralized, cryptographic proof-of-existence, immutable registration timestamps, and perceptual similarity detection. Blockchain records serve as tamper-evident ownership evidence. ProofVault AI does not provide statutory legal advice or substitute for official government copyright registration (such as the US Copyright Office, EUIPO, or WIPO) where statutory registration is required for statutory damages.*
