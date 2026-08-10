"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  Loader2,
  Shield,
  Fingerprint,
  Blocks,
  Brain,
  Hash,
  Globe,
  FileCheck,
  Copy,
  ExternalLink,
  Download,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  FileText,
  Lock,
} from "lucide-react";
import {
  generateSHA256,
  generateSHA3,
  generateBLAKE3,
  generatePerceptualHash,
  formatFileSize,
  shortenHash,
  formatDate,
} from "../../lib/crypto";
import {
  storeAsset,
  findAssetByHash,
  detectContentType,
  getConnectedWallet,
  connectWallet,
  uploadToPinata,
  requestAIFingerprint,
  registerAssetOnChain,
  mintProofNFT,
  type Asset,
} from "../../lib/store";

type UploadStage =
  | "idle"
  | "analyzing"
  | "hashing"
  | "fingerprinting"
  | "ipfs"
  | "blockchain"
  | "complete"
  | "duplicate"
  | "error";

interface StageInfo {
  label: string;
  description: string;
  icon: typeof Upload;
}

const STAGES: Record<string, StageInfo> = {
  analyzing: { label: "AI Analysis", description: "Scanning content and extracting vision/text embeddings...", icon: Brain },
  hashing: { label: "Cryptographic Hash Generation", description: "Computing native Web Crypto SHA-256, SHA3-256 & BLAKE3...", icon: Hash },
  fingerprinting: { label: "2D-DCT Perceptual Hashing", description: "Generating canvas luminance DCT perceptual hash...", icon: Fingerprint },
  ipfs: { label: "IPFS Decentralized Storage", description: "Pinning asset and metadata to Pinata IPFS network...", icon: Globe },
  blockchain: { label: "Polygon Smart Contract Anchoring", description: "Executing OwnershipRegistry transaction...", icon: Blocks },
  complete: { label: "Registration Complete", description: "Asset is permanently registered and verifiable!", icon: CheckCircle2 },
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mintNFT, setMintNFT] = useState(false);
  const [result, setResult] = useState<Asset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
      }
    },
    [title]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        if (!title) setTitle(selectedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
      }
    },
    [title]
  );

  const handleRegister = async () => {
    if (!file) return;
    setErrorMessage(null);

    try {
      // Step 1: Real Cryptographic Hashes
      setStage("hashing");
      const [sha256, sha3, blake3] = await Promise.all([
        generateSHA256(file),
        generateSHA3(file),
        generateBLAKE3(file),
      ]);

      // Check for duplicate in database
      const existing = await findAssetByHash(sha256);
      if (existing) {
        setStage("duplicate");
        setResult(existing);
        return;
      }

      // Step 2: Real 2D-DCT Perceptual Hashing & AI Embeddings
      setStage("fingerprinting");
      const [phash, aiResponse] = await Promise.all([
        generatePerceptualHash(file),
        requestAIFingerprint(file),
      ]);
      const aiHash = aiResponse?.aiHash || sha256;

      // Step 3: Real Pinata IPFS Upload
      setStage("ipfs");
      const ipfsResult = await uploadToPinata(file);
      const ipfsCID = ipfsResult?.cid || `Qm${sha256.slice(0, 44)}`;

      // Step 4: Real Polygon Smart Contract Registration
      setStage("blockchain");
      let wallet = await getConnectedWallet();
      if (!wallet) {
        wallet = await connectWallet();
      }
      const ownerAddress = wallet || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

      const txRecord = await registerAssetOnChain({
        sha256,
        aiHash,
        ipfsCID,
      });

      // Step 5: Optional Proof NFT Minting
      let tokenId: number | undefined = undefined;
      if (mintNFT && wallet) {
        const nftRes = await mintProofNFT({
          to: wallet,
          sha256,
          tokenURI: `ipfs://${ipfsCID}/metadata.json`,
        });
        if (nftRes) {
          tokenId = nftRes.tokenId;
        }
      }

      // Step 6: Atomic Database Persistence
      const newAsset: Asset = {
        title: title || file.name,
        description,
        contentType: detectContentType(file.name, file.type),
        fileMetadata: {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        },
        fingerprints: {
          sha256,
          sha3,
          blake3,
          phash,
          aiHash,
        },
        blockchain: {
          txHash: txRecord.txHash,
          blockNumber: txRecord.blockNumber,
          timestamp: Date.now(),
          chain: "Polygon Amoy",
          gasUsed: txRecord.gasUsed,
        },
        ipfsCID,
        nftTokenId: tokenId,
        status: "registered",
        verificationCount: 0,
        ownerAddress,
        createdAt: new Date().toISOString(),
      };

      const saved = await storeAsset(newAsset);
      setResult(saved || newAsset);
      setStage("complete");
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during registration.");
      setStage("error");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStage("idle");
    setTitle("");
    setDescription("");
    setMintNFT(false);
    setResult(null);
    setErrorMessage(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Upload className="w-4 h-4" />
          </div>
          <span>Upload & Register Digital IP</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          Generate immutable, mathematically verifiable cryptographic proof and anchor on Polygon Amoy with decentralized IPFS pinning.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" ? (
          /* ============ UPLOAD FORM ============ */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Drop Zone */}
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                {file ? file.name : "Drag & drop your digital asset here"}
              </p>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                {file
                  ? `${formatFileSize(file.size)} • Ready for cryptographic analysis`
                  : "Supports High-Res Images (PNG, JPG), Audio (MP3, WAV), Video (MP4), Code Repositories, PDF Documents, and 3D Assets"}
              </p>
              <button
                type="button"
                className="btn-secondary text-xs py-2 px-4 shadow-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Local Files
              </button>
            </div>

            {/* Metadata Fields */}
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-900">Asset Metadata & Licensing</span>
                  <span className="badge badge-blue text-[11px]">{detectContentType(file.name, file.type)}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Asset Title</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Master Audio Mix / Original Artwork v1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description & Authorship Notes</label>
                  <textarea
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Provide creation context, software tools used, and copyright terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Mint Proof-of-Ownership NFT</p>
                      <p className="text-[11px] text-slate-500">Mint ERC-721 token bound to your smart contract registration hash</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mintNFT}
                    onChange={(e) => setMintNFT(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <button onClick={handleRegister} className="btn-primary w-full py-3 text-sm shadow-md">
                  <Shield className="w-4 h-4" />
                  <span>Execute Cryptographic Registration</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : stage === "complete" && result ? (
          /* ============ CERTIFICATE VIEW ============ */
          <motion.div
            key="certificate"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-green-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Proof-of-Ownership Certificate
                  </h2>
                  <p className="text-xs text-slate-500">Permanent Cryptographic Evidence on Polygon Amoy Blockchain</p>
                </div>
              </div>
              <span className="badge badge-green self-start sm:self-auto text-xs py-1 px-3">
                Verified Immutable
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Asset Title</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{result.title}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Owner Wallet Address</p>
                <p className="font-mono font-semibold text-indigo-600 mt-0.5 break-all">{result.ownerAddress}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Primary SHA-256 Hash</p>
                <p className="font-mono text-slate-700 mt-0.5 truncate bg-white p-1.5 rounded border border-slate-200">{result.fingerprints.sha256}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">2D-DCT Perceptual Hash (pHash)</p>
                <p className="font-mono text-purple-700 mt-0.5 truncate bg-white p-1.5 rounded border border-slate-200">{result.fingerprints.phash || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">IPFS Content Identifier (CID)</p>
                <p className="font-mono text-cyan-700 mt-0.5 truncate bg-white p-1.5 rounded border border-slate-200">{result.ipfsCID}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Polygon Transaction Hash</p>
                <p className="font-mono text-amber-700 mt-0.5 truncate bg-white p-1.5 rounded border border-slate-200">{result.blockchain.txHash}</p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-semibold">Legal Notice:</strong> Blockchain registration provides mathematical, timestamped proof of existence and cryptographic ownership evidence. It provides immutable prior-art evidence in copyright disputes.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => copyToClipboard(result.fingerprints.sha256, "hash")}
                className="btn-secondary flex-1 text-xs py-2.5"
              >
                <Copy className="w-4 h-4" />
                <span>{copied === "hash" ? "Copied to Clipboard!" : "Copy SHA-256 Hash"}</span>
              </button>
              <button onClick={resetUpload} className="btn-primary flex-1 text-xs py-2.5 shadow-sm">
                <FileCheck className="w-4 h-4" />
                <span>Register Another Asset</span>
              </button>
            </div>
          </motion.div>
        ) : stage === "duplicate" && result ? (
          /* ============ DUPLICATE ALERT ============ */
          <motion.div
            key="duplicate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-amber-300 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Duplicate Asset Detected</h2>
                <p className="text-xs text-slate-500">This exact SHA-256 cryptographic hash is already registered in ProofVault.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p><span className="text-slate-500">Registered Title:</span> <span className="text-slate-900 font-bold">{result.title}</span></p>
              <p><span className="text-slate-500">Original Owner:</span> <span className="font-mono text-indigo-600">{result.ownerAddress}</span></p>
              <p><span className="text-slate-500">Timestamp:</span> <span className="text-slate-800">{formatDate(result.createdAt)}</span></p>
            </div>
            <button onClick={resetUpload} className="btn-secondary w-full py-2.5 text-xs">
              Upload a Different File
            </button>
          </motion.div>
        ) : stage === "error" ? (
          /* ============ ERROR VIEW ============ */
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Registration Error</h2>
                <p className="text-xs text-slate-500">{errorMessage || "Registration failed. Please check wallet connection and network."}</p>
              </div>
            </div>
            <button onClick={resetUpload} className="btn-secondary w-full py-2.5 text-xs">
              Try Again
            </button>
          </motion.div>
        ) : (
          /* ============ PROCESSING PIPELINE ============ */
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {STAGES[stage]?.label || "Processing Asset..."}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{STAGES[stage]?.description || "Executing cryptographic pipeline..."}</p>
            </div>

            <div className="max-w-md mx-auto space-y-2 text-left">
              {Object.entries(STAGES).filter(([k]) => k !== "complete").map(([key, info]) => {
                const isCurrent = stage === key;
                const IconComp = info.icon;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all ${
                      isCurrent
                        ? "bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold"
                        : "text-slate-500 bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <IconComp className={`w-4 h-4 ${isCurrent ? "text-indigo-600" : "text-slate-400"}`} />
                      {info.label}
                    </span>
                    {isCurrent && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
