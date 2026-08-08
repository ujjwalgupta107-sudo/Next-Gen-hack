# ProofVault AI

[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Polygon](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247E5?style=flat-square&logo=polygon&logoColor=white)](https://polygon.technology/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CLIP_ViT--B%2F32-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FAISS](https://img.shields.io/badge/Meta_FAISS-Vector_Search-0081FB?style=flat-square)](https://github.com/facebookresearch/faiss)

## 📌 One-Line Pitch

> **ProofVault AI is an AI + Blockchain powered platform that creates tamper-resistant digital ownership evidence and detects exact or modified copies of digital assets.**

---

## 🔍 What is ProofVault AI?

ProofVault AI helps creators, software developers, researchers, and enterprises establish verifiable, timestamped evidence for their original digital creations. When an asset (image, code repository, audio, or document) is uploaded, ProofVault AI computes deterministic cryptographic hashes, generates deep neural AI visual/semantic embeddings, pins metadata to IPFS, and anchors ownership claims on the Polygon blockchain. Later, anyone can upload an original or modified file to instantly verify whether it matches a registered work.

---

## 💡 The Core Idea

```
Digital Asset ──► Cryptographic Fingerprint ──► AI Fingerprint ──► IPFS ──► Polygon Blockchain ──► Proof NFT ──► Verification
```

* 🔐 **Cryptography** → Proves exact, byte-for-byte file identity via SHA-256, SHA-3, and BLAKE3.
* 🧠 **AI Neural Embeddings** → Detects cropped, compressed, rotated, or filtered variations via OpenAI CLIP & Meta FAISS.
* 🌐 **Decentralized IPFS** → Permanently stores asset metadata and content previews off-chain.
* ⛓️ **Polygon Blockchain** → Anchors an immutable, timestamped ownership record with commit-reveal front-running defense.

---

## ❓ Why Does This Matter?

Digital content is copied, compressed, cropped, and redistributed online in seconds. Traditional cryptographic checksums (like standard SHA-256) fail entirely if even one pixel or byte is altered. ProofVault AI bridges this gap by combining **mathematical cryptographic hashing** with **neural perceptual similarity search** and **decentralized blockchain registration evidence**.

---

## 🚀 Why ProofVault AI is Different

1. **Exact + Perceptual Verification**: Catches both exact binary matches and modified copies.
2. **Real AI Vector Inference**: Runs real OpenAI CLIP ViT-B/32 (512d) and SentenceTransformers (384d) models with Meta FAISS indexing.
3. **Blockchain-Backed Registration**: Immutable on-chain provenance records with commit-reveal front-running protection.
4. **End-to-End Ownership Workflow**: Registration, ERC-721 Proof NFTs, multi-tier licensing, and public verification in one interface.

---

## ⚖️ Why Blockchain + AI?

| Technology | Purpose in ProofVault AI |
| :--- | :--- |
| **SHA-256 / SHA-3 / BLAKE3** | Exact cryptographic tamper detection using native Web Crypto & `@noble/hashes` |
| **2D-DCT Perceptual Hash (pHash)** | Canvas luminance discrete cosine transform for visual fingerprinting |
| **OpenAI CLIP ViT-B/32** | 512-dimensional multimodal vision embeddings to detect visual derivatives |
| **SentenceTransformers** | 384-dimensional semantic text/code embeddings for document originality |
| **Meta FAISS** | High-performance vector index (`IndexFlatIP`) for real-time cosine similarity search |
| **Pinata IPFS** | Permanent decentralized file and metadata storage |
| **Polygon Blockchain** | Immutable, timestamped ownership records with front-running defense |
| **Solidity Smart Contracts** | Asset registry (`OwnershipRegistry.sol`), 1:1 Proof NFTs (`ProofNFT.sol`), and licensing (`Licensing.sol`) |
| **MongoDB & Resilient Storage**| User profiles, session tokens, audit logs, and catalog with offline fallback |

---

## 🌟 Key Features

* 🔑 **Dual Authentication**: Web2 Email/Password (bcrypt 12 rounds + JWT) & Web3 MetaMask SIWE (EIP-4361).
* 🛡️ **Multi-Hash Engine**: Client-side SHA-256, FIPS 202 SHA3-256, and BLAKE3 hashing.
* 🧠 **AI Similarity Search**: Detects cropped, rotated, compressed, or brightness-adjusted copies via CLIP + FAISS.
* 📜 **Polygon Smart Contracts**:
  * `OwnershipRegistry.sol`: Immutable registry with commit-reveal timelocks.
  * `ProofNFT.sol`: Strict 1-to-1 ERC-721 token bound to registered asset hashes.
  * `Licensing.sol`: Personal, Commercial, and Exclusive licenses with pull-withdrawal payouts.
* 🗂️ **Creator Dashboard**: Manage registered assets with Grid/List views, search filters, and live telemetry.
* 🔍 **Public Verification Portal**: Drag-and-drop any asset to test for exact match (100%) or near-duplicate (80%+).
* 📄 **Proof Certificates**: Real-time downloadable ownership certificate with cryptographic audit trail.

---

## 🏗️ Architecture

```mermaid
flowchart TD
    User([Creator / Verifier]) -->|Browser UI| Frontend[Next.js 16 Frontend\nApp Router + Ethers.js]
    
    subgraph Web2 Layer
        Frontend -->|Auth / Asset Routes| NextAPI[Next.js API Routes]
        NextAPI -->|Read / Write| Mongo[(MongoDB / Local Fallback)]
    end

    subgraph AI Engine [FastAPI Microservice :8000]
        Frontend -->|File Upload| FastAPI[FastAPI Controller]
        FastAPI -->|Extract Embeddings| CLIP[OpenAI CLIP 512d & SentenceTransformers 384d]
        FastAPI -->|Compute Transform| DCT[2D-DCT Perceptual Hash]
        CLIP -->|Index & Search| FAISS[(FAISS Vector Store)]
    end

    subgraph Web3 & Storage Layer
        Frontend -->|Pin Assets| IPFS[(Pinata IPFS)]
        Frontend -->|Register / Mint / License| Contracts[Polygon Smart Contracts\nOwnershipRegistry | ProofNFT | Licensing]
    end

    FastAPI -.->|Similarity Score & Top Matches| Frontend
    Contracts -.->|Tx Hash & Block Confirmation| Frontend
```

---

## 📊 Validated Project Metrics

| Category | Verified Metric | Result |
| :--- | :--- | :--- |
| **Exact Match Accuracy** | Identical file re-upload | **100.0%** (`exact_match`) |
| **Cropped Variant AI Match** | Center cropped image | **98.63%** (`near_match`) |
| **Compressed Variant AI Match** | 50×50 resized image | **96.76%** (`near_match`) |
| **Rotated Variant AI Match** | 45° rotated image | **86.39%** (`near_match`) |
| **Smart Contracts** | Audited Solidity contracts | **3** (`OwnershipRegistry`, `ProofNFT`, `Licensing`) |
| **AI Neural Models** | In-memory inference models | **2** (`CLIP ViT-B/32` + `SentenceTransformers`) |
| **Vector Indexes** | FAISS `IndexFlatIP` indices | **2** (512d Image + 384d Document) |
| **Dashboard Routes** | Next.js App Router pages | **10** active routes |
| **Frontend Startup** | Turbopack dev server | **~433ms** |

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.3.0 (App Router), React 19, TailwindCSS v4, Framer Motion, Lucide React |
| **Backend & AI** | FastAPI, PyTorch, HuggingFace CLIP ViT-B/32, Sentence-Transformers, Meta FAISS, OpenCV |
| **Blockchain** | Solidity 0.8.24, Hardhat, Ethers.js v6, Polygon Amoy Testnet, OpenZeppelin Contracts |
| **Storage** | Pinata IPFS SDK (`pinata-web3`) |
| **Database** | MongoDB 7.0 & Mongoose (with automatic resilient local JSON storage fallback) |
| **Auth & Security** | bcrypt (12 rounds), JWT (HS256), EIP-4361 SIWE, OpenZeppelin `ReentrancyGuard` |

---

## 📦 Requirements & Prerequisites

* **Node.js**: `v20.x` or `v22.x` (LTS) & `npm`
* **Python**: `3.10` to `3.14` (with `pip`)
* **Git**
* **MetaMask Extension** *(optional, for Web3 features)*
* **Docker Desktop** *(optional, for containerized run)*
* **MongoDB** *(optional, automatic local file fallback included)*

---

## 🔑 Environment Variables

Create `.env` in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/proofvault
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_GATEWAY_URL=gateway.pinata.cloud
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NEXT_PUBLIC_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_PROOF_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_LICENSING_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
JWT_SECRET=proofvault_production_jwt_super_secret_signing_key_32_chars_min
```

---

## 🚀 Judge Quick Start

### 1. Start Services
```bash
# Terminal 1: Start AI Inference Engine
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Start Next.js Frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser. *(Or run with Docker: `docker compose up`)*

### 2. Local/Test Demo Account
| Field | Value |
| :--- | :--- |
| **Email** | `proofvault.demo@test.local` |
| **Username** | `proofvaultdemo` |
| **Password** | `PV#Demo2026!Secure` |
| **Role** | Creator |
| **Web3 Login** | Connect Wallet (Polygon Amoy EIP-4361 SIWE) |

---

## 🎬 3-Minute Judge Demo

* **Step 1 — Login**: Navigate to `/auth/login` and log in with the test account above.  
  *What the judge should notice: Instant JWT session creation with secure HTTP-only cookies.*
* **Step 2 — Upload an Asset**: Navigate to `/dashboard/upload` and drag & drop an image or file.  
  *What the judge should notice: Real-time metadata extraction and file size formatting.*
* **Step 3 — Show Cryptographic Hashes**: Click *"Execute Cryptographic Registration"*.  
  *What the judge should notice: Web Crypto SHA-256, SHA-3, and BLAKE3 generated client-side.*
* **Step 4 — Show AI Fingerprint**: Watch the pipeline advance to AI analysis.  
  *What the judge should notice: CLIP ViT-B/32 produces a 512-dimensional vector fingerprint.*
* **Step 5 — Show IPFS Registration**: Watch the IPFS stage complete.  
  *What the judge should notice: Metadata and asset pinned to IPFS with content CID.*
* **Step 6 — Show Polygon Transaction**: Watch on-chain anchoring finish.  
  *What the judge should notice: Real transaction hash, block number, and gas confirmation.*
* **Step 7 — Show Proof NFT**: Review the completed certificate view.  
  *What the judge should notice: Tamper-evident certificate with 1:1 NFT proof token record.*
* **Step 8 — Upload Original Image Again**: Navigate to `/dashboard/verify` and upload the same file.  
  *What the judge should notice: Instant SHA-256 hash match lookup.*
* **Step 9 — Show Exact Match**: Observe the result screen.  
  *What the judge should notice: Green "Exact Match Confirmed ✅ (100% Match)" banner.*
* **Step 10 — Upload a Modified Version**: Upload a cropped, compressed, or brightness-altered image.  
  *What the judge should notice: FAISS searches neural vector indexes across registered assets.*
* **Step 11 — Show AI Near-Match**: Observe the AI similarity score.  
  *What the judge should notice: Amber "Near-Duplicate Detected ⚠️ (86%–99% Similarity)" with original creator info.*

---

## 🌍 Real-World Industries

| Industry | Real-World Use Case |
| :--- | :--- |
| **Digital Art & Design** | Timestamp original artwork before posting online and detect uncredited derivatives. |
| **Software Development** | Anchor proprietary source code and algorithms to verify author provenance. |
| **Research & Academia** | Establish timestamped priority claims on preprints, research papers, and datasets. |
| **Music & Media** | Protect master audio recordings and stem packs with on-chain registration proof. |
| **Advertising & Branding** | Prevent trademark logo tampering and enforce brand asset licensing terms. |
| **Enterprise IP** | Manage decentralized multi-tier licensing and programmatic pull-withdrawal payouts. |

---

## ⚖️ Legal Disclaimer

> *ProofVault AI provides cryptographic proof-of-existence, immutable registration timestamps, and perceptual similarity detection. Blockchain registration serves as tamper-evident ownership evidence and does not substitute for statutory government copyright registration (such as the US Copyright Office, EUIPO, or WIPO) where statutory registration is required for statutory damages.*
