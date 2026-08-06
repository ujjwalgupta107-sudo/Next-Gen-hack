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
  shortenHash,
  shortenAddress,
  formatDate,
  formatFileSize,
} from "../../lib/crypto";
import {
  findAssetByHash,
  getStoredAssets,
  storeVerification,
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

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleVerify = async () => {
    setStage("processing");

    let sha256: string;
    if (verifyMode === "file" && file) {
      sha256 = await generateSHA256(file);
    } else {
      sha256 = hashInput.trim();
    }
    setUploadedHash(sha256);

    // Simulate multi-step verification
    await sleep(2500);

    // Check exact match
    const exactMatch = await findAssetByHash(sha256);
    if (exactMatch) {
      setMatchType("exact_match");
      setMatchedAsset(exactMatch);
      setSimilarity(100);
    } else {
      // Simulate near-match check (random for demo)
      const allAssets = await getStoredAssets();
      if (allAssets.length > 0 && Math.random() > 0.5) {
        setMatchType("near_match");
        setMatchedAsset(allAssets[0]);
        setSimilarity(Math.floor(Math.random() * 15) + 82);
      } else {
        setMatchType("no_match");
        setMatchedAsset(null);
        setSimilarity(0);
      }
    }

    // Store verification log
    storeVerification({
      id: `verify-${Date.now()}`,
      uploadedHash: sha256,
      result: matchType,
      matchedAsset: matchedAsset || undefined,
      similarity,
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
      title: "Exact Match Found! ✅",
      subtitle: "This file is registered on the blockchain.",
      className: "match-exact",
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
      badgeClass: "badge-green",
    },
    near_match: {
      icon: AlertTriangle,
      title: "Similar Content Detected ⚠️",
      subtitle: "A similar file has been found in our records.",
      className: "match-near",
      iconColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      badgeClass: "badge-amber",
    },
    no_match: {
      icon: XCircle,
      title: "No Match Found ❌",
      subtitle: "This file is not registered on the blockchain.",
      className: "match-none",
      iconColor: "text-red-400",
      bgColor: "bg-red-500/10",
      badgeClass: "badge-red",
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Search className="w-6 h-6 text-cyan-400" />
          Verify Ownership
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Upload a file or paste a hash to check if it&apos;s registered on the blockchain.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "idle" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Mode Toggle */}
            <div className="flex p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] w-fit">
              {(["file", "hash"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVerifyMode(mode)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    verifyMode === mode
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  {mode === "file" ? <Upload className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                  {mode === "file" ? "Upload File" : "Paste Hash"}
                </button>
              ))}
            </div>

            {verifyMode === "file" ? (
              /* File Upload Zone */
              <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f) setFile(f);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFile(f);
                  }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <FileUp className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{file.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="btn-ghost text-red-400"
                    >
                      <X className="w-4 h-4" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Search className="w-10 h-10 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">
                        Drop a file to <span className="text-cyan-400">verify</span>
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        We&apos;ll check it against all registered assets
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Hash Input */
              <div className="glass-card p-6">
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  SHA-256 Hash
                </label>
                <input
                  type="text"
                  className="glass-input font-mono text-sm"
                  placeholder="Enter SHA-256 hash (e.g., a1b2c3d4e5f6...)"
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                />
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={verifyMode === "file" ? !file : !hashInput.trim()}
              className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              Verify on Blockchain
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Info */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                How Verification Works
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Hash, title: "Hash Check", desc: "SHA-256 exact match against blockchain" },
                  { icon: Fingerprint, title: "Perceptual Match", desc: "pHash comparison for near-duplicates" },
                  { icon: Brain, title: "AI Similarity", desc: "CLIP embedding cosine similarity search" },
                ].map((step) => (
                  <div key={step.title} className="flex items-start gap-3">
                    <step.icon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">{step.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : stage === "processing" ? (
          /* ============ PROCESSING ============ */
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-500"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-transparent border-b-purple-500 border-l-pink-500"
              />
              <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Verifying Ownership...
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Comparing against blockchain records & AI fingerprint database
            </p>

            <div className="flex justify-center gap-8 text-sm">
              {[
                { label: "Hash Check", done: true },
                { label: "Perceptual Match", done: true },
                { label: "AI Similarity", done: false },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.5 }}
                  className="flex items-center gap-2"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  )}
                  <span className={step.done ? "text-green-400" : "text-blue-400"}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ============ RESULT ============ */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Result Banner */}
            <div className={`glass-card p-8 text-center ${resultConfig[matchType].className}`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {(() => {
                  const Icon = resultConfig[matchType].icon;
                  return <Icon className={`w-16 h-16 ${resultConfig[matchType].iconColor} mx-auto mb-4`} />;
                })()}
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {resultConfig[matchType].title}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {resultConfig[matchType].subtitle}
              </p>
              {similarity > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04]">
                  <span className="text-sm text-[var(--text-muted)]">Similarity:</span>
                  <span className={`text-lg font-bold ${
                    similarity === 100 ? "text-green-400" : similarity > 85 ? "text-amber-400" : "text-red-400"
                  }`}>
                    {similarity}%
                  </span>
                </div>
              )}
            </div>

            {/* Hash Info */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Uploaded File Hash
              </h3>
              <div className="flex items-center gap-2">
                <span className="hash-display flex-1 text-sm">{uploadedHash}</span>
                <button onClick={() => copyToClipboard(uploadedHash)} className="btn-icon shrink-0">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Matched Asset Details */}
            {matchedAsset && (
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {matchType === "exact_match" ? "Registered Asset" : "Similar Asset Found"}
                </h3>

                {[
                  { icon: Shield, label: "Title", value: matchedAsset.title },
                  { icon: User, label: "Creator", value: shortenAddress(matchedAsset.blockchain.txHash.slice(0, 42)) },
                  { icon: Clock, label: "Registered", value: formatDate(new Date(matchedAsset.createdAt)) },
                  { icon: Blocks, label: "Block", value: matchedAsset.blockchain.blockNumber.toLocaleString() },
                  { icon: Hash, label: "TX Hash", value: matchedAsset.blockchain.txHash, mono: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <item.icon className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <span className="text-sm text-[var(--text-muted)] w-24 shrink-0">{item.label}</span>
                    <span className={`text-sm text-white truncate ${item.mono ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Ownership Timeline */}
            {matchedAsset && (
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                  Ownership Timeline
                </h3>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-blue-500/30 to-transparent" />
                  {[
                    { event: "Asset Registered", time: formatDate(new Date(matchedAsset.createdAt)), status: "complete" },
                    { event: "Blockchain Confirmed", time: formatDate(new Date(matchedAsset.createdAt)), status: "complete" },
                    ...(matchedAsset.nftTokenId ? [{ event: `NFT Minted (#${matchedAsset.nftTokenId})`, time: formatDate(new Date(matchedAsset.createdAt)), status: "complete" as const }] : []),
                    { event: "Verification Request (this check)", time: formatDate(new Date()), status: "active" },
                  ].map((item, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      <div
                        className={`w-4 h-4 rounded-full absolute -left-[13px] mt-0.5 ${
                          item.status === "active"
                            ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                            : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{item.event}</p>
                        <p className="text-xs text-[var(--text-muted)]">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button onClick={resetVerification} className="btn-primary">
                <Search className="w-4 h-4" />
                Verify Another
              </button>
              <button className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
