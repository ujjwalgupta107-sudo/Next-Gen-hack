"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Star,
  CheckCircle2,
  Blocks,
  Upload,
  Search,
  FileKey,
  Copy,
  ExternalLink,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
} from "lucide-react";
import { getConnectedWallet, getStoredAssets, type Asset } from "../../lib/store";
import { shortenAddress, shortenHash, formatDate } from "../../lib/crypto";

export default function ProfilePage() {
  const [wallet, setWallet] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      const w = await getConnectedWallet();
      setWallet(w || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      const stored = await getStoredAssets();
      setAssets(stored);
    }
    loadData();
  }, []);

  const stats = [
    { label: "Assets Registered", value: assets.length, icon: Shield },
    { label: "Verifications", value: assets.reduce((s, a) => s + a.verificationCount, 0), icon: Search },
    { label: "NFTs Minted", value: assets.filter((a) => a.nftTokenId !== null).length, icon: Blocks },
    { label: "Licenses Sold", value: 23, icon: FileKey },
  ];

  const badges = [
    { name: "Early Adopter", desc: "Joined during beta", icon: "🚀", earned: true },
    { name: "Prolific Creator", desc: "10+ assets registered", icon: "🎨", earned: assets.length >= 10 },
    { name: "Verified", desc: "Identity verified", icon: "✅", earned: true },
    { name: "Community Hero", desc: "50+ verifications", icon: "🦸", earned: false },
    { name: "NFT Collector", desc: "5+ NFTs minted", icon: "💎", earned: false },
    { name: "Top Creator", desc: "Top 10% by registrations", icon: "👑", earned: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Avatar & Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-[var(--bg-primary)] flex items-center justify-center shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Creator
                </h2>
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[var(--text-secondary)]">{shortenAddress(wallet)}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(wallet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button className="btn-secondary self-start sm:self-auto">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Bio */}
          <div className="mt-4 flex items-center gap-4 text-sm text-[var(--text-muted)] flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined August 2026</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Decentralized</span>
            <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> proofvault.ai</span>
          </div>
        </div>
      </div>

      {/* Reputation */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Reputation Score
          </h3>
          <span className="text-2xl font-bold gradient-text">950</span>
        </div>
        <div className="progress-bar h-3 mb-2">
          <motion.div
            className="progress-bar-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: "95%" }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)]">950 / 1000 — Top 5% of creators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card text-center"
          >
            <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-[11px] text-[var(--text-muted)]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Badges */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-purple-400" />
          Achievement Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.name}
              className={`p-4 rounded-xl border transition-all ${
                badge.earned
                  ? "bg-white/[0.03] border-white/[0.06] hover:border-white/10"
                  : "bg-white/[0.01] border-white/[0.03] opacity-40"
              }`}
            >
              <div className="text-2xl mb-2">{badge.icon}</div>
              <p className="text-sm font-medium text-white">{badge.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{badge.desc}</p>
              {badge.earned && <span className="badge badge-green text-[10px] mt-2 inline-flex">Earned</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
