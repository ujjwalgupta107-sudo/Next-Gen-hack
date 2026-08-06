"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileUp,
  CheckCircle2,
  Loader2,
  Shield,
  Fingerprint,
  Blocks,
  Brain,
  Hash,
  Globe,
  FileCheck,
  X,
  Image,
  Film,
  Music,
  Code,
  FileText,
  Palette,
  Copy,
  ExternalLink,
  Download,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  generateSHA256,
  generateSHA3,
  generateBLAKE3,
  generatePerceptualHash,
  generateMockTxHash,
  generateMockIPFSCID,
  formatFileSize,
  shortenHash,
} from "../../lib/crypto";
import {
  storeAsset,
  findAssetByHash,
  detectContentType,
  getConnectedWallet,
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
  duration: number;
}

const STAGES: Record<string, StageInfo> = {
  analyzing: { label: "AI Analysis", description: "Scanning content and detecting file type...", icon: Brain, duration: 1200 },
  hashing: { label: "Hash Generation", description: "Computing SHA-256, SHA3-256, BLAKE3 hashes...", icon: Hash, duration: 800 },
  fingerprinting: { label: "AI Fingerprinting", description: "Generating perceptual hash & embedding vectors...", icon: Fingerprint, duration: 1500 },
  ipfs: { label: "IPFS Upload", description: "Encrypting and uploading to decentralized storage...", icon: Globe, duration: 1000 },
  blockchain: { label: "Blockchain Anchoring", description: "Registering on Polygon with commit-reveal...", icon: Blocks, duration: 2000 },
  complete: { label: "Registration Complete", description: "Your asset is now protected on the blockchain!", icon: CheckCircle2, duration: 0 },
};

const ACCEPTED_TYPES = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "text/*",
  "application/javascript",
  "application/json",
  "application/zip",
].join(",");

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mintNFT, setMintNFT] = useState(false);
  const [result, setResult] = useState<Asset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
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

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleRegister = async () => {
    if (!file) return;

    try {
      // Stage 1: AI Analysis
      setStage("analyzing");
      setProgress(10);
      await sleep(1200);

      // Stage 2: Hash Generation (real SHA-256)
      setStage("hashing");
      setProgress(30);
      const sha256 = await generateSHA256(file);
      const sha3 = await generateSHA3(file);
      const blake3 = await generateBLAKE3(file);

      // Check for duplicate
      const existing = findAssetByHash(sha256);
      if (existing) {
        setStage("duplicate");
        setResult(existing);
        return;
      }

      await sleep(800);

      // Stage 3: Fingerprinting
      setStage("fingerprinting");
      setProgress(50);
      const phash = generatePerceptualHash();
      const dhash = generatePerceptualHash();
      await sleep(1500);

      // Stage 4: IPFS Upload
      setStage("ipfs");
      setProgress(70);
      const ipfsCID = generateMockIPFSCID();
      await sleep(1000);

      // Stage 5: Blockchain
      setStage("blockchain");
      setProgress(90);
      const txHash = generateMockTxHash();
      await sleep(2000);

      // Complete
      setProgress(100);
      const newAsset: Asset = {
        id: `asset-${Date.now()}`,
        title: title || file.name,
        description,
        contentType: detectContentType(file.type),
        fileMetadata: {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        },
        fingerprints: { sha256, sha3, blake3, phash, dhash },
        blockchain: {
          txHash,
          blockNumber: 45_000_000 + Math.floor(Math.random() * 1_000_000),
          timestamp: Date.now(),
          chain: "Polygon",
          gasUsed: (Math.random() * 0.01).toFixed(6),
        },
        ipfsCID,
        nftTokenId: mintNFT ? Math.floor(Math.random() * 10000) : null,
        status: "registered",
        verificationCount: 0,
        createdAt: new Date().toISOString(),
      };

      storeAsset(newAsset);
      setResult(newAsset);
      setStage("complete");
    } catch {
      setStage("error");
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStage("idle");
    setProgress(0);
    setTitle("");
    setDescription("");
    setMintNFT(false);
    setResult(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const stageKeys = Object.keys(STAGES);
  const currentStageIndex = stageKeys.indexOf(stage);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Upload className="w-6 h-6 text-blue-400" />
          Upload & Register
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Upload any digital file to create an immutable, AI-verified ownership proof on the blockchain.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" ? (
          /* ============ UPLOAD FORM ============ */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Drop Zone */}
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_TYPES}
                onChange={handleFileSelect}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileUp className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{file.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {formatFileSize(file.size)} • {file.type || "Unknown type"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="btn-ghost text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse-glow">
                    <Upload className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      Drop your file here or <span className="text-blue-400">browse</span>
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      Images, Videos, Audio, Code, Documents, Designs • Max 100MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Form */}
            {file && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glass-card p-6 space-y-4"
              >
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Asset Details</h3>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Title</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Give your asset a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Description (optional)</label>
                  <textarea
                    className="glass-input min-h-[80px] resize-y"
                    placeholder="Describe your digital asset..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* NFT Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <Blocks className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Mint Proof NFT</p>
                      <p className="text-xs text-[var(--text-muted)]">Create a composable ERC-721 ownership NFT</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMintNFT(!mintNFT)}
                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                      mintNFT ? "bg-blue-500" : "bg-white/10"
                    }`}
                  >
                    <motion.div
                      animate={{ x: mintNFT ? 22 : 3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white absolute top-1"
                    />
                  </button>
                </div>

                {/* Register Button */}
                <button onClick={handleRegister} className="btn-primary w-full py-4 text-base">
                  <Shield className="w-5 h-5" />
                  Register on Blockchain
                  <Sparkles className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : stage === "complete" || stage === "duplicate" ? (
          /* ============ RESULT ============ */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Success/Duplicate Banner */}
            <div
              className={`glass-card p-8 text-center ${
                stage === "complete" ? "match-exact" : "match-near"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {stage === "complete" ? (
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                )}
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stage === "complete"
                  ? "Registration Complete! 🎉"
                  : "Duplicate Detected ⚠️"}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {stage === "complete"
                  ? "Your asset is now immutably recorded on the Polygon blockchain."
                  : "This file has already been registered on the blockchain."}
              </p>
            </div>

            {/* Details */}
            {result && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Registration Details</h3>

                {[
                  { label: "Title", value: result.title },
                  { label: "Content Type", value: result.contentType, badge: true },
                  { label: "SHA-256 Hash", value: result.fingerprints.sha256, hash: true },
                  { label: "SHA3-256 Hash", value: result.fingerprints.sha3, hash: true },
                  { label: "BLAKE3 Hash", value: result.fingerprints.blake3, hash: true },
                  { label: "Perceptual Hash", value: result.fingerprints.phash, hash: true },
                  { label: "IPFS CID", value: result.ipfsCID, hash: true },
                  { label: "Transaction Hash", value: result.blockchain.txHash, hash: true },
                  { label: "Block Number", value: result.blockchain.blockNumber.toLocaleString() },
                  { label: "Chain", value: result.blockchain.chain, badge: true },
                  { label: "Gas Used", value: `${result.blockchain.gasUsed} MATIC` },
                  ...(result.nftTokenId !== null
                    ? [{ label: "NFT Token ID", value: `#${result.nftTokenId}`, badge: true }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 py-2 border-b border-white/[0.03] last:border-0"
                  >
                    <span className="text-sm text-[var(--text-muted)] sm:w-40 shrink-0">{item.label}</span>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.hash ? (
                        <span className="hash-display text-[11px] flex-1 truncate">{item.value}</span>
                      ) : item.badge ? (
                        <span className="badge badge-blue">{item.value}</span>
                      ) : (
                        <span className="text-sm text-white">{item.value}</span>
                      )}
                      {item.hash && (
                        <button
                          onClick={() => copyToClipboard(item.value as string, item.label)}
                          className="btn-icon w-7 h-7 shrink-0"
                          title="Copy"
                        >
                          {copied === item.label ? (
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={resetUpload} className="btn-primary">
                <Upload className="w-4 h-4" />
                Register Another
              </button>
              <button className="btn-secondary">
                <Download className="w-4 h-4" />
                Download Certificate
              </button>
              <button className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>
          </motion.div>
        ) : (
          /* ============ PROCESSING ============ */
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-8"
          >
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Processing...</span>
                <span className="text-sm text-[var(--text-muted)]">{progress}%</span>
              </div>
              <div className="progress-bar h-2">
                <motion.div
                  className="progress-bar-fill h-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Stage steps */}
            <div className="space-y-4">
              {stageKeys.map((key, i) => {
                const info = STAGES[key];
                const isActive = key === stage;
                const isDone = i < currentStageIndex;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : isDone
                        ? "bg-green-500/5 border border-green-500/10"
                        : "bg-white/[0.01] border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-blue-500/20 text-blue-400"
                          : isDone
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/[0.04] text-[var(--text-muted)]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <info.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isActive ? "text-white" : isDone ? "text-green-400" : "text-[var(--text-muted)]"}`}>
                        {info.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{info.description}</p>
                    </div>
                    {isDone && <span className="badge badge-green text-[10px] shrink-0">Done</span>}
                    {isActive && <span className="badge badge-blue text-[10px] shrink-0">In Progress</span>}
                  </motion.div>
                );
              })}
            </div>

            {/* Current file info */}
            {file && (
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                <FileUp className="w-5 h-5 text-[var(--text-muted)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
