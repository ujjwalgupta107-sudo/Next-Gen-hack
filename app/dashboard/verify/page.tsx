"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Shield,
  Hash,
  Fingerprint,
  Brain,
  Clock,
  User,
  Blocks,
  Copy,
  ExternalLink,
  FileUp,
  X,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  generateSHA256,
  generatePerceptualHash,
  shortenHash,
  shortenAddress,
  formatDate,
  formatFileSize,
} from "../../lib/crypto";
import {
  findAssetByHash,
  getStoredAssets,
  storeVerification,
  checkAISimilarity,
  type Asset,
  type VerificationResult,
} from "../../lib/store";

type VerifyStage = "idle" | "processing" | "result";
type MatchType = "exact_match" | "near_match" | "no_match";

export default function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hashInput, setHashInput] = useState("");
  const [verifyMode, setVerifyMode] = useState<"file" | "hash">("file");
  const [stage, setStage] = useState<VerifyStage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [matchType, setMatchType] = useState<MatchType>("no_match");
  const [matchedAsset, setMatchedAsset] = useState<Asset | null>(null);
  const [similarity, setSimilarity] = useState(0);
  const [uploadedHash, setUploadedHash] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  }, []);

  const handleVerify = async () => {
    setStage("processing");

    let sha256 = "";
    if (verifyMode === "file" && file) {
      sha256 = await generateSHA256(file);
    } else {
      sha256 = hashInput.trim();
    }
    setUploadedHash(sha256);

    let detectedMatch: MatchType = "no_match";
    let matchedRecord: Asset | null = null;
    let computedSimilarity = 0;

    // Step 1: Check Exact SHA-256 cryptographic match in database
    const exactMatch = await findAssetByHash(sha256);
    if (exactMatch) {
      detectedMatch = "exact_match";
      matchedRecord = exactMatch;
      computedSimilarity = 100;
    } else if (file) {
      // Step 2: Real Multimodal AI Neural Vector Search (FAISS + CLIP)
      const aiResult = await checkAISimilarity(file);
      if (aiResult && aiResult.topMatches && aiResult.topMatches.length > 0) {
        const top = aiResult.topMatches[0];
        const score = Math.round(top.score * 100);
        if (score >= 80) {
          detectedMatch = "near_match";
          computedSimilarity = score;
          if (top.sha256) {
            matchedRecord = await findAssetByHash(top.sha256);
          }
        }
      }
    }

    setMatchType(detectedMatch);
    setMatchedAsset(matchedRecord);
    setSimilarity(computedSimilarity);

    // Record verification search in database
    await storeVerification({
      uploadedHash: sha256,
      result: detectedMatch,
      matchedAsset: matchedRecord || undefined,
      similarity: computedSimilarity,
      timestamp: new Date().toISOString(),
    });

    setStage("result");
  };

  const resetVerification = () => {
    setFile(null);
    setHashInput("");
    setStage("idle");
    setMatchType("no_match");
    setMatchedAsset(null);
    setSimilarity(0);
    setUploadedHash("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resultConfig = {
    exact_match: {
      icon: CheckCircle2,
      title: "Exact Match Confirmed ✅",
      subtitle: "This file is cryptographically registered and anchored on Polygon.",
      badgeClass: "badge-green",
      borderColor: "border-green-500/30",
    },
    near_match: {
      icon: AlertTriangle,
      title: "Perceptual Near-Duplicate Detected ⚠️",
      subtitle: "A visually or semantically similar asset exists in the registry.",
      badgeClass: "badge-amber",
      borderColor: "border-amber-500/30",
    },
    no_match: {
      icon: XCircle,
      title: "No Match in Registry ❌",
      subtitle: "This file has not yet been registered in ProofVault AI.",
      badgeClass: "badge-red",
      borderColor: "border-red-500/30",
    },
  };

  const activeResult = resultConfig[matchType];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Search className="w-6 h-6 text-purple-400" />
          Verify Digital Asset & Similarity Search
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Perform instantaneous multi-modal verification: exact SHA-256 validation & FAISS neural vector similarity.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" ? (
          /* ============ INPUT VIEW ============ */
          <motion.div
            key="verify-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Mode Switcher */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
              <button
                onClick={() => setVerifyMode("file")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  verifyMode === "file" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                File Verification (Full AI & Hash)
              </button>
              <button
                onClick={() => setVerifyMode("hash")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  verifyMode === "hash" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                Direct SHA-256 Lookup
              </button>
            </div>

            {verifyMode === "file" ? (
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
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                  <Search className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  {file ? file.name : "Drag & drop file to test for originality or infringement"}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {file ? `${formatFileSize(file.size)} • Ready for FAISS scan` : "Checks exact hash + neural vision vector cosine distance"}
                </p>
              </div>
            ) : (
              <div className="glass-card p-6 space-y-4">
                <label className="block text-xs font-semibold text-[var(--text-secondary)]">Enter 64-character SHA-256 Hash</label>
                <input
                  type="text"
                  className="glass-input font-mono text-xs"
                  placeholder="e.g. 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                />
              </div>
            )}

            {(file || (verifyMode === "hash" && hashInput.length >= 64)) && (
              <button onClick={handleVerify} className="btn-primary w-full py-3 text-sm">
                <Shield className="w-4 h-4" />
                Execute Multi-Modal Verification
              </button>
            )}
          </motion.div>
        ) : stage === "processing" ? (
          /* ============ PROCESSING VIEW ============ */
          <motion.div
            key="verify-processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white">Scanning Neural Vector Indexes...</h2>
            <p className="text-xs text-[var(--text-secondary)]">Computing cosine distance across CLIP & SentenceTransformers FAISS embeddings.</p>
          </motion.div>
        ) : (
          /* ============ RESULT VIEW ============ */
          <motion.div
            key="verify-result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-8 border ${activeResult.borderColor} space-y-6`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <activeResult.icon className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white">{activeResult.title}</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{activeResult.subtitle}</p>
                </div>
              </div>
              <span className={`badge ${activeResult.badgeClass}`}>
                {matchType === "exact_match" ? "100% Match" : matchType === "near_match" ? `${similarity}% Similarity` : "0% Match"}
              </span>
            </div>

            {matchedAsset && (
              <div className="grid sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 text-xs">
                <div>
                  <p className="text-[var(--text-muted)]">Registered Title</p>
                  <p className="font-semibold text-white text-sm mt-0.5">{matchedAsset.title}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Registered Owner</p>
                  <p className="font-mono text-blue-400 mt-0.5">{matchedAsset.ownerAddress}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Registration Timestamp</p>
                  <p className="text-white mt-0.5">{formatDate(matchedAsset.createdAt)}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">IPFS Content Identifier</p>
                  <p className="font-mono text-cyan-400 mt-0.5 truncate">{matchedAsset.ipfsCID}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Polygon Transaction Hash</p>
                  <p className="font-mono text-amber-400 mt-0.5 truncate">{matchedAsset.blockchain.txHash}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)]">Content Category</p>
                  <p className="text-white mt-0.5 capitalize">{matchedAsset.contentType}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => copyToClipboard(uploadedHash)} className="btn-secondary flex-1 text-xs py-2.5">
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy Verification Hash"}
              </button>
              <button onClick={resetVerification} className="btn-primary flex-1 text-xs py-2.5">
                Verify Another Asset
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
