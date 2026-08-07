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
8. [Prerequisites](#-prerequisites)
9. [Clone Repository](#-clone-repository)
10. [Install Frontend Dependencies](#-install-frontend-dependencies)
11. [Install Backend Dependencies](#-install-backend-dependencies)
12. [Environment Variables](#-environment-variables)
13. [Running with Docker](#-running-with-docker)
14. [Running Without Docker](#-running-without-docker)
15. [Connecting MetaMask](#-connecting-metamask)
16. [Running AI Service](#-running-ai-service)
17. [Running Smart Contracts](#-running-smart-contracts)
18. [Running Complete Project](#-running-complete-project)
19. [Demo Walkthrough](#-demo-walkthrough)
20. [Troubleshooting](#-troubleshooting)
21. [Production Deployment](#-production-deployment)
22. [Verification Checklist](#-verification-checklist)
23. [Legal Notice](#legal-notice)

---

## 3. Introduction

### What is ProofVault AI?
ProofVault AI is a decentralized intellectual property (IP) verification platform. It creates permanent, tamper-proof proof-of-existence and cryptographic ownership evidence for digital assets—including artwork, codebase repositories, research papers, music tracks, vector graphics, and media documents.

### Why Was It Built?
In the modern generative AI era, digital assets are duplicated, scraped, and manipulated within seconds. ProofVault AI provides borderless, instant, and mathematically verifiable IP registration that empowers creators with cryptographic proof of ownership before distributing work online.

---

## 4. Problem Statement

Digital creators, developers, and researchers face systemic vulnerabilities:
- **Zero Proof of Prior Creation**: Once digital content is published online, establishing exact timestamped provenance in legal or commercial disputes is difficult without expensive escrow intermediaries.
- **Generative AI & Plagiarism**: Bad actors can slightly crop, filter, compress, or paraphrase copyrighted material to evade naive checksums.
- **Centralized Vulnerabilities**: Centralized registries and copyright depositories can be altered, suffer single points of failure, or shut down.
- **Complex Blockchain UX**: Traditional Web3 dApps require complex manual contract interactions, gas calculations, and fragmented tooling.

---

## 5. Solution

ProofVault AI solves digital ownership with a 4-tier cryptographic pipeline:
- ⛓️ **Blockchain Anchoring (Polygon)**: Smart contracts record asset hashes, owner wallet addresses, and timestamps in unalterable block transactions with commit-reveal anti-frontrunning protection.
- 🧠 **Perceptual Neural AI (FastAPI + CLIP + 2D-DCT)**: Transforms images and text into normalized vector embeddings and 2D-DCT perceptual hashes for nearest-neighbor similarity detection.
- 📦 **Decentralized IPFS Storage (Pinata)**: Off-chain asset metadata standards and encrypted representations are pinned to IPFS for permanent decentralized availability.
- 🔐 **ERC-721 Proof NFTs & Licensing**: Creators can optionally mint 1-to-1 unique proof-of-ownership NFTs and set automated multi-tier licensing terms (Personal, Commercial, Exclusive) with pull-withdrawal payout protection.

---

## 6. Key Features

- **Multi-Modal Cryptographic Fingerprinting**: Web Crypto SHA-256, FIPS 202 SHA3-256, BLAKE3, and 2D-DCT perceptual hashing.
- **Deep Neural Similarity Search**: OpenAI CLIP (512-dim visual embeddings) and SentenceTransformers (384-dim semantic text vectors) backed by Meta FAISS vector indexing.
- **Commit-Reveal Anti-Frontrunning**: Two-stage blockchain registration preventing mempool frontrunning bots from stealing authorship.
- **Tamper-Evident Digital Certificates**: Dynamic PDF and cryptographic JSON certificates embedded with QR codes, transaction hashes, IPFS CIDs, and cryptographic signatures.
- **Multi-Tier Smart Licensing**: Programmatic licensing contracts with automatic escrow, refund guards, and royalty payouts.
- **Responsive Glassmorphism UI**: Built on Next.js 16 with real-time drag-and-drop ingestion, live telemetry, and dark/light adaptive aesthetics.

---

## 8. Architecture

```
                                  +---------------------------------------+
                                  |         User Browser / MetaMask       |
                                  |    (Next.js 16 App Router + Ethers)   |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
        +---------------------------------+                       +---------------------------------+
        |      Frontend Next.js API       |                       |        FastAPI AI Engine        |
        |  - Web Crypto SHA-256 / BLAKE3  |                       |  - OpenAI CLIP ViT-B/32 (512d)  |
        |  - SIWE Authentication          |                       |  - SentenceTransformers (384d)  |
        |  - Pinata IPFS Relay            |                       |  - Meta FAISS Vector Search     |
        |  - Mongoose Asset Metadata      |                       |  - OpenCV Perceptual Hashing    |
        +----------------+----------------+                       +----------------+----------------+
                         |                                                         |
                         v                                                         v
        +---------------------------------+                       +---------------------------------+
        |         MongoDB Database        |                       |       FAISS Index Storage       |
        |  (Assets, Certs, Audit Logs)    |                       |      (/app/vector_data/*.index) |
        +---------------------------------+                       +---------------------------------+
                         |
                         v
        +---------------------------------+
        |    Polygon Blockchain (Amoy)    |
        |  - OwnershipRegistry.sol        |
        |  - ProofNFT.sol (ERC-721)       |
        |  - Licensing.sol (Royalties)    |
        +---------------------------------+
```

---

## 9. Technology Stack

| Layer | Technology | Version | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | 16.3.0 | Server & Client components, App Router, SSR, Turbopack. |
| **User Interface** | React + TailwindCSS | 19.2 / 4.0 | Glassmorphic design system and responsive UI. |
| **Cryptography** | Web Crypto & @noble/hashes | FIPS 202 | SHA-256, SHA3-256, BLAKE3, and 2D-DCT pHash. |
| **Web3 Wallet Library** | Ethers.js | 6.17.0 | Web3 provider for MetaMask interaction and smart contract encoding. |
| **AI Inference API** | FastAPI | 0.111.0 | Asynchronous Python REST microservice. |
| **Neural AI Models** | OpenAI CLIP & HuggingFace | PyTorch 2.3+ | Vision-language multi-modal embedding generation. |
| **Vector Search Engine**| Meta FAISS | 1.8.0+ | Inner-product vector indexing for fast similarity lookup. |
| **Smart Contracts** | Solidity | 0.8.24 | OpenZeppelin Ownable, ReentrancyGuard, ERC721URIStorage. |
| **Database** | MongoDB & Mongoose | 7.0 / 9.9.1 | Asset metadata, user ownership profiles, and verification audit logs. |
| **Decentralized Storage**| Pinata IPFS SDK | 0.5.4 | Enterprise pinning services for immutable off-chain metadata. |

---

## 14. Smart Contracts

1. **`OwnershipRegistry.sol`**: Manages immutable proof hashes with commit-reveal timelocks (`MIN_COMMITMENT_AGE = 2` blocks), replay defense, and authorship verification.
2. **`Licensing.sol`**: Multi-tier licensing terms (Personal, Commercial, Exclusive) with initialization guards, automatic overpayment refunds, and reentrancy-guarded pull withdrawals.
3. **`ProofNFT.sol`**: ERC-721 token bound to registered hashes, enforcing strict 1-to-1 uniqueness per asset hash with on-chain metadata URI storage.

---

# 🚀 Getting Started & Local Setup

Follow this comprehensive, beginner-friendly step-by-step guide to run the complete ProofVault AI ecosystem on your local machine.

---

## 📦 Prerequisites

Before starting, ensure your system has the following software installed:

| Software | Recommended Version | Purpose | Download Link |
| :--- | :--- | :--- | :--- |
| **Node.js (LTS)** | `v20.x` or `v22.x` | Next.js frontend & Hardhat environment | [nodejs.org](https://nodejs.org/) |
| **npm** | `v10.x+` | JavaScript package manager | Included with Node.js |
| **Python** | `3.12+` (3.12 - 3.14) | FastAPI neural engine & PyTorch models | [python.org](https://www.python.org/) |
| **Docker Desktop** | `v24.0+` (Compose v2+) | Containerized multi-service orchestration | [docker.com](https://www.docker.com/) |
| **Git** | `v2.40+` | Version control & repository cloning | [git-scm.com](https://git-scm.com/) |
| **MetaMask Extension** | `v11.x+` | Web3 wallet for signing & Polygon transactions | [metamask.io](https://metamask.io/) |
| **MongoDB Community** | `v7.0+` | Metadata database (*only if running without Docker*) | [mongodb.com](https://www.mongodb.com/try/download/community) |

> [!TIP]
> **Hardware Recommendation**: A system with at least 8 GB RAM (16 GB recommended) and a modern multi-core CPU or NVIDIA GPU is ideal for fast neural embedding generation and FAISS vector indexing.

---

## 📥 Clone Repository

Clone the project repository from GitHub and navigate into the root directory:

```bash
git clone https://github.com/ujjwalgupta107-sudo/Next-Gen-hack.git ProofVault-AI
cd ProofVault-AI
```

---

## 💻 Install Frontend Dependencies

Navigate to the project root and install all frontend and Web3 packages:

```bash
# From the project root
npm install
```

### What gets installed:
- **`next` (v16)** & **`react` (v19)**: The modern App Router core and UI engine.
- **`ethers` (v6)**: Web3 contract interaction, signature verification, and provider abstraction.
- **`@noble/hashes`**: High-security, FIPS-compliant cryptographic hashing (`sha256`, `sha3`, `blake3`).
- **`pinata` / `@pinata/sdk`**: IPFS decentralized file and metadata pinning.
- **`mongoose`**: Object Data Modeling (ODM) library for MongoDB.
- **`tailwindcss` (v4)** & **`lucide-react`**: Glassmorphism styling and icon set.
- **`canvas-confetti`** & **`jspdf`**: Verification animations and cryptographic PDF certificate generator.

---

## 🐍 Install Backend Dependencies

The backend AI service uses FastAPI, PyTorch, CLIP, and FAISS for deep perceptual similarity and vector search.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```

4. Install the backend requirements:
   ```bash
   pip install -r requirements.txt
   ```

### What gets installed:
- **`fastapi`** & **`uvicorn[standard]`**: High-throughput asynchronous ASGI microservice framework.
- **`torch`**, **`torchvision`**, **`torchaudio`**: PyTorch neural execution engine.
- **`transformers`**: Hugging Face library running `openai/clip-vit-base-patch32` for 512-dim visual embeddings.
- **`sentence-transformers`**: Generates 384-dimensional dense semantic text/code vectors.
- **`faiss-cpu`**: Meta's high-efficiency vector similarity index (`IndexFlatIP`).
- **`opencv-python`** & **`Pillow`**: Perceptual image hashing (2D-DCT) and image transforms.
- **`librosa`** & **`soundfile`**: Audio feature extraction and waveform analysis.

5. Return to the project root:
   ```bash
   cd ..
   ```

---

## 🔑 Environment Variables

ProofVault AI requires environment variables for database connections, IPFS pinning, blockchain transactions, and AI services.

Create your `.env` file by copying the provided template:

```bash
cp .env.example .env
```

### Complete Environment Variable Reference:

| Variable Name | Required | Default / Example Value | Description |
| :--- | :---: | :--- | :--- |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/proofvault` | Connection URI for the local or Atlas MongoDB database. |
| `PINATA_API_KEY` | Optional | `your_pinata_api_key` | Pinata IPFS account API key. |
| `PINATA_SECRET_API_KEY` | Optional | `your_pinata_secret` | Pinata IPFS secret key. |
| `PINATA_JWT` | **Yes** | `eyJhbGciOi...` | Pinata JWT Bearer Token for uploading asset files and metadata to IPFS. |
| `NEXT_PUBLIC_GATEWAY_URL` | **Yes** | `gateway.pinata.cloud` | IPFS gateway URL for retrieving asset previews and certificates. |
| `PRIVATE_KEY` | **Yes** | `0xac0974bec39a17e36ba4a6...` | EVM wallet private key for deploying smart contracts. *(Never use mainnet real funds!)* |
| `AMOY_RPC_URL` | **Yes** | `https://rpc-amoy.polygon.technology` | Polygon Amoy Testnet RPC endpoint. |
| `NEXT_PUBLIC_REGISTRY_ADDRESS` | **Yes** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Deployed `OwnershipRegistry.sol` smart contract address. |
| `NEXT_PUBLIC_PROOF_NFT_ADDRESS`| **Yes** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Deployed `ProofNFT.sol` ERC-721 smart contract address. |
| `NEXT_PUBLIC_LICENSING_ADDRESS`| **Yes** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Deployed `Licensing.sol` smart contract address. |
| `NEXT_PUBLIC_FASTAPI_URL` | **Yes** | `http://localhost:8000` | URL of the Python FastAPI neural inference microservice. |
| `JWT_SECRET` | **Yes** | `proofvault_jwt_secret_key_32_chars` | Secret key for signing and validating session tokens & SIWE auth. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API key for automated metadata enhancement. |

> [!WARNING]
> **Security Notice**: Never commit your `.env` file or private keys to GitHub or public repositories. The `.gitignore` file is configured to exclude all `.env*` files by default.

---

## 🐳 Running with Docker

Docker is the fastest way to run the entire ProofVault AI infrastructure (Frontend, Backend AI, and MongoDB) in isolated containers with a single command.

### Docker Commands:

1. **Build all containers**:
   ```bash
   docker compose build
   ```

2. **Start all services in the background**:
   ```bash
   docker compose up -d
   ```

3. **View live aggregated container logs**:
   ```bash
   docker compose logs -f
   ```

4. **Check status of running containers**:
   ```bash
   docker ps
   ```

5. **Stop and tear down containers**:
   ```bash
   docker compose down
   ```

### Container Architecture Overview:

```
+-------------------------------------------------------------------------------+
|                             DOCKER COMPOSE NETWORK                            |
|                                                                               |
|  +--------------------+     +--------------------+     +-------------------+  |
|  |     frontend       |     |      backend       |     |       mongo       |  |
|  |    (Port 3000)     | <-> |    (Port 8000)     | <-> |   (Port 27017)    |  |
|  | Next.js App Router |     | FastAPI+CLIP+FAISS |     | MongoDB v7.0 Engine|  |
|  +--------------------+     +--------------------+     +-------------------+  |
|                                      |                           |            |
|                                      v                           v            |
|                              [vector_data volume]       [mongodb_data volume] |
+-------------------------------------------------------------------------------+
```

- **Frontend Container (`frontend`)**: Runs Next.js 16 production server on `http://localhost:3000`.
- **Backend Container (`backend`)**: Runs FastAPI on `http://localhost:8000` with PyTorch, CLIP, and FAISS loaded.
- **MongoDB Container (`mongo`)**: Official `mongo:7.0` container on port `27017` with data persistence.
- **Named Volumes**:
  - `mongodb_data`: Preserves MongoDB document collections across restarts.
  - `vector_data`: Preserves serialized FAISS nearest-neighbor index files (`image.index` & `doc.index`).

---

## 🛠️ Running Without Docker

If you prefer to run services natively on your host machine for development and hot-reloading:

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017`:
- **Windows**: Start the MongoDB service via `services.msc` or run:
  ```powershell
  net start MongoDB
  ```
- **macOS (Homebrew)**:
  ```bash
  brew services start mongodb-community@7.0
  ```
- **Linux (systemd)**:
  ```bash
  sudo systemctl start mongod
  ```

### Step 2: Start Backend AI Service
```bash
# In terminal 1 (with .venv activated)
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Verify at `http://localhost:8000/health`.*

### Step 3: Start Local Hardhat Node (Optional for local testing)
```bash
# In terminal 2
cd blockchain
npx hardhat node
```
*Starts a local Ethereum JSON-RPC node on `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

### Step 4: Deploy Smart Contracts
```bash
# In terminal 3
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```
*Note the printed contract addresses and update your `.env` accordingly.*

### Step 5: Start Frontend
```bash
# In terminal 4 (from project root)
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🦊 Connecting MetaMask

ProofVault AI interacts with the Polygon blockchain for asset anchoring, NFT minting, and licensing.

```
       +------------------+       +------------------+       +------------------+
       | 1. Add Network   |  -->  | 2. Get Test POL  |  -->  | 3. Connect &     |
       | (Polygon Amoy)   |       | (Faucet)         |       |    Sign SIWE     |
       +------------------+       +------------------+       +------------------+
```

### 1. Add Polygon Amoy Testnet to MetaMask:
Open MetaMask > Click Network Selector > **Add Network** > **Add a network manually**:

| Field | Value |
| :--- | :--- |
| **Network Name** | `Polygon Amoy Testnet` |
| **New RPC URL** | `https://rpc-amoy.polygon.technology` |
| **Chain ID** | `80002` |
| **Currency Symbol** | `POL` |
| **Block Explorer URL** | `https://amoy.polygonscan.com/` |

### 2. Get Free Amoy Testnet POL:
To pay for gas transactions on the testnet, request free test POL from any of the following faucets:
- [Polygon Official Faucet](https://faucet.polygon.technology/)
- [Alchemy Amoy Faucet](https://www.alchemy.com/faucets/polygon-amoy)
- [QuickNode Faucet](https://faucet.quicknode.com/polygon/amoy)

### 3. Connect Wallet & Sign SIWE:
1. Open `http://localhost:3000`.
2. Click **Connect Wallet** in the top right navigation bar.
3. Select **MetaMask** and approve the connection request.
4. When prompted, sign the **Sign-In with Ethereum (SIWE)** cryptographic message to authenticate your session.

---

## 🧠 Running AI Service

The AI microservice performs perceptual feature extraction, multi-modal vector embeddings, and similarity matching.

```
       Asset Upload (Image / Document / Code)
                         |
         +---------------+---------------+
         |                               |
  [Visual Input]                  [Textual Input]
         |                               |
         v                               v
  OpenAI CLIP ViT-B/32          SentenceTransformers
   (512-dim Vector)              (384-dim Vector)
         |                               |
         +---------------+---------------+
                         |
                         v
               L2 Vector Normalization
                         |
                         v
              Meta FAISS IndexFlatIP
         (Instant Similarity Search & Indexing)
```

### How the AI Models Work:
1. **OpenAI CLIP (`openai/clip-vit-base-patch32`)**:
   - Downloads automatically on first boot into PyTorch cache.
   - Extracts semantic visual features from images (PNG, JPEG, WebP, GIF, etc.).
   - Produces a normalized **512-dimensional** vector embedding.
2. **SentenceTransformers (`all-MiniLM-L6-v2`)**:
   - Processes textual content, code files (`.py`, `.ts`, `.sol`, `.js`, etc.), PDFs, and research notes.
   - Generates a dense **384-dimensional** semantic vector.
3. **Meta FAISS Vector Store (`IndexFlatIP`)**:
   - Performs cosine inner-product similarity search across previously indexed vectors in sub-millisecond time.
   - Persists vector indices to disk (`backend/vector_data/image.index` and `backend/vector_data/doc.index`).

### How to Verify the AI Service:
Run a health check request using `curl` or open in your browser:

```bash
curl http://localhost:8000/health
```

**Expected JSON Response:**
```json
{
  "status": "healthy",
  "service": "ProofVault AI Neural Engine",
  "models": {
    "clip_vit_b32": true,
    "sentence_transformers": true
  },
  "indexed_images": 0,
  "indexed_docs": 0
}
```

---

## 📜 Running Smart Contracts

ProofVault AI's smart contracts are written in Solidity `0.8.24` and managed with Hardhat.

### 1. Compile Contracts:
```bash
cd blockchain
npx hardhat compile
```

### 2. Deploy to Localhost:
```bash
# Ensure `npx hardhat node` is running in another window
npx hardhat run scripts/deploy.ts --network localhost
```

### 3. Deploy to Polygon Amoy Testnet:
```bash
# Ensure PRIVATE_KEY is populated in your .env
npx hardhat run scripts/deploy.ts --network polygonAmoy
```

**Deployment Output Example:**
```text
Deploying contracts with the account: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
OwnershipRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ProofNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Licensing deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 4. Verify Contracts on Polygonscan (Optional):
```bash
npx hardhat verify --network polygonAmoy <DEPLOYED_REGISTRY_ADDRESS>
```

---

## 🔄 Running Complete Project

To run the entire system smoothly from scratch, follow this exact sequence:

```
+-------------------------------------------------------------------------------------+
|                              EXECUTION ORDER MATRIX                                 |
|                                                                                     |
|  [Step 1] Start Database: Docker (`docker compose up -d`) OR local MongoDB service  |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 2] Start Backend: `cd backend && uvicorn main:app --reload --port 8000`      |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 3] Verify AI Engine: `curl http://localhost:8000/health`                     |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 4] Deploy Contracts: `cd blockchain && npx hardhat run scripts/deploy.ts`   |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 5] Start Frontend: `npm run dev` -> Open `http://localhost:3000`             |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 6] Connect MetaMask: Switch to Polygon Amoy & Sign In                        |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 7] Register Asset: Drag & Drop file -> Cryptographic Hash -> IPFS -> Chain  |
|                                  |                                                  |
|                                  v                                                  |
|  [Step 8] Verify Asset: Search hash or upload duplicate to test neural match        |
+-------------------------------------------------------------------------------------+
```

---

## 🎬 Demo Walkthrough

Experience the complete end-to-end user journey in ProofVault AI:

```
  +------------------+        +------------------+        +------------------+
  |  1. MetaMask     |  --->  |  2. Drag & Drop  |  --->  |  3. Multi-Hash   |
  |     Login (SIWE) |        |     Asset File   |        |     Generation   |
  +------------------+        +------------------+        +------------------+
                                                                    |
                                                                    v
  +------------------+        +------------------+        +------------------+
  |  6. Polygon      |  <---  |  5. IPFS Upload  |  <---  |  4. AI Neural    |
  |     Anchoring    |        |     (Pinata)     |        |     Fingerprint  |
  +------------------+        +------------------+        +------------------+
          |
          v
  +------------------+        +------------------+        +------------------+
  |  7. Proof NFT    |  --->  |  8. Tamper-Proof |  --->  |  9. Instant      |
  |     Minting      |        |     Certificate  |        |     Verification |
  +------------------+        +------------------+        +------------------+
```

1. **MetaMask Login**: Connect wallet and authenticate using cryptographic Sign-In with Ethereum (SIWE).
2. **Upload Asset**: Navigate to `/dashboard/register` and drop any digital creation (image, video, code file, document).
3. **Generate SHA-256 / SHA3 / BLAKE3**: The browser client computes deterministic cryptographic hashes in real-time.
4. **Generate AI Fingerprint**: The FastAPI microservice generates CLIP/SentenceTransformer vector embeddings and indexes them in FAISS.
5. **Upload to IPFS**: Encrypted metadata and asset bundles are securely pinned to Pinata IPFS.
6. **Polygon Anchoring**: Trigger the `commit()` and `revealRegistration()` transactions on `OwnershipRegistry.sol`.
7. **NFT Minting**: Optionally mint an ERC-721 ProofNFT bound to your registration hash.
8. **Generate Certificate**: Download an official cryptographic PDF certificate with verification QR code.
9. **Public Verification**: Navigate to `/dashboard/verify` and drop any file to perform instant exact or near-duplicate AI detection.

---

## 🔧 Troubleshooting

Common issues and their verified solutions:

### 1. Docker Daemon Not Running
- **Symptoms**: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock` or `error during connect`.
- **Fix**: Open Docker Desktop and ensure the engine status shows green ("Engine running"). On Linux, run `sudo systemctl start docker`.

### 2. MongoDB Connection Failed (`ECONNREFUSED 127.0.0.1:27017`)
- **Symptoms**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`.
- **Fix**: Ensure MongoDB is running. If using Docker, ensure `mongo` container is healthy (`docker ps`). For local MongoDB, start service with `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux).

### 3. MetaMask Not Connecting or Wrong Chain
- **Symptoms**: `Chain mismatch: expected 80002`.
- **Fix**: Open MetaMask, switch to **Polygon Amoy Testnet**, and ensure Chain ID is `80002` (0x13882).

### 4. Pinata Upload Failed / 401 Unauthorized
- **Symptoms**: `Pinata upload error: 401 Unauthorized`.
- **Fix**: Check `PINATA_JWT` in your `.env`. Generate a fresh Admin JWT from [app.pinata.cloud/developers/api-keys](https://app.pinata.cloud/developers/api-keys).

### 5. Polygon RPC Error / Insufficient Funds
- **Symptoms**: `ProviderError: execution reverted` or `insufficient funds for gas * price + value`.
- **Fix**: Request testnet POL from the [Polygon Amoy Faucet](https://faucet.polygon.technology/). Verify `AMOY_RPC_URL` is responsive.

### 6. FAISS Index Not Found / Permissions Error
- **Symptoms**: `FileNotFoundError: vector_data/image.index`.
- **Fix**: Ensure the `backend/vector_data/` directory exists. The backend creates indices automatically on startup if directory permissions are writable.

### 7. Python Dependencies Missing
- **Symptoms**: `ModuleNotFoundError: No module named 'sentence_transformers'`.
- **Fix**: Ensure your virtual environment is active (`.venv\Scripts\activate` on Windows, `source .venv/bin/activate` on Linux/macOS) and run `pip install -r backend/requirements.txt`.

### 8. Node Modules Missing / Port 3000 In Use
- **Symptoms**: `Error: Cannot find module` or `EADDRINUSE: address already in use :::3000`.
- **Fix**: Run `npm install`. If port 3000 is occupied, kill the conflicting process (`npx kill-port 3000`) or run Next.js on another port with `npm run dev -- -p 3001`.

### 9. TypeScript Compilation Errors
- **Symptoms**: `npm run build` fails with type errors.
- **Fix**: Run `npx tsc --noEmit` to identify type issues. Ensure your `tsconfig.json` matches project standards.

---

## 🌐 Production Deployment

```
       +------------------------------------------------------------------+
       |                    PRODUCTION CLOUD TOPOLOGY                     |
       |                                                                  |
       |  [Frontend]      Next.js 16 Edge / Vercel Serverless             |
       |  [Backend]       AWS EC2 / GCP Cloud Run / Railway (FastAPI)     |
       |  [Database]      MongoDB Atlas M10+ Dedicated Cluster            |
       |  [IPFS]          Dedicated Pinata Gateway with Custom Domain     |
       |  [Blockchain]    Polygon Amoy Testnet -> Polygon POS Mainnet     |
       +------------------------------------------------------------------+
```

### 1. Frontend (Vercel / Cloud Container):
- Connect your GitHub repository to [Vercel](https://vercel.com).
- Set Environment Variables in Project Settings.
- Build Command: `npm run build` | Output Directory: `.next`.

### 2. Backend (AWS EC2 / DigitalOcean / Cloud Run):
- Deploy with Docker using the provided `backend/Dockerfile`.
- Mount a persistent volume for `/app/vector_data` to preserve the FAISS index.
- Configure Gunicorn with Uvicorn workers:
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
  ```

### 3. Database (MongoDB Atlas):
- Create a production M0 or M10 cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
- Whitelist your server IP addresses or allow `0.0.0.0/0` with strong password auth.
- Set `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/proofvault?retryWrites=true&w=majority`.

### 4. Smart Contracts (Polygon Mainnet):
- Deploy contracts to Polygon Mainnet:
  ```bash
  npx hardhat run scripts/deploy.ts --network polygonMainnet
  ```
- Update `NEXT_PUBLIC_REGISTRY_ADDRESS`, `NEXT_PUBLIC_PROOF_NFT_ADDRESS`, and `NEXT_PUBLIC_LICENSING_ADDRESS` in production environment variables.

---

## ✅ Verification Checklist

Use this interactive checklist to confirm your deployment is 100% operational:

- [ ] **Frontend Running**: `http://localhost:3000` loads with glassmorphism UI.
- [ ] **Backend Running**: `http://localhost:8000` returns healthy status.
- [ ] **AI Models Loaded**: `clip_vit_b32` and `sentence_transformers` are `true` in `/health`.
- [ ] **MongoDB Connected**: Assets and audit logs persist without errors.
- [ ] **Docker Healthy**: `docker ps` shows all containers in `Up (healthy)` state.
- [ ] **MetaMask Connected**: Wallet connects and detects Polygon Amoy (Chain ID: `80002`).
- [ ] **Smart Contracts Deployed**: Registry, ProofNFT, and Licensing addresses populated in `.env`.
- [ ] **Asset Upload Works**: Computes SHA-256, SHA3, BLAKE3, and perceptual pHash.
- [ ] **IPFS Upload Works**: Pinata returns valid IPFS CID and gateway URL.
- [ ] **Polygon Anchoring Works**: Commit-reveal transaction completes on-chain.
- [ ] **NFT Minting Works**: ERC-721 token minted and viewable in dashboard.
- [ ] **Verification Works**: Duplicate upload flags near-match or exact match in real-time.

---

## Legal Notice

> **Legal Disclaimer**: *Blockchain provides immutable proof of registration and ownership evidence. ProofVault AI provides decentralized, cryptographic proof-of-existence, immutable registration timestamps, and perceptual similarity detection. Blockchain records serve as tamper-evident ownership evidence. ProofVault AI does not provide statutory legal advice or substitute for official government copyright registration (such as the US Copyright Office, EUIPO, or WIPO) where statutory registration is required for statutory damages.*
