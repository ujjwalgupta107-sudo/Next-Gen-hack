"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Upload,
  Search,
  Shield,
  TrendingUp,
  FileCheck,
  Blocks,
  Clock,
  ArrowUpRight,
  Activity,
  Image as ImageIcon,
  Music,
  Code,
  FileText,
  Film,
  Palette,
  Brain,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe,
  Lock,
} from "lucide-react";
import { getStoredAssets, MOCK_STATS, type Asset } from "../lib/store";
import { shortenHash, shortenAddress, formatDate, formatFileSize, timeAgo } from "../lib/crypto";

const CONTENT_ICONS: Record<string, typeof ImageIcon> = {
  Image: ImageIcon,
  Video: Film,
  Audio: Music,
  "Source Code": Code,
  Document: FileText,
  "Design File": Palette,
  "AI Generated": Brain,
};

export default function DashboardPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      const stored = await getStoredAssets();
      setAssets(stored);
      setIsLoading(false);
    }
    loadAssets();
  }, []);

  const stats = [
    {
      label: "Total Assets Registered",
      value: assets.length.toString(),
      change: "+12%",
      icon: Shield,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Verification Audits",
      value: assets.reduce((s, a) => s + (a.verificationCount || 0), 0).toString(),
      change: "+24%",
      icon: FileCheck,
      bg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Proof NFTs Minted",
      value: assets.filter((a) => a.nftTokenId !== null && a.nftTokenId !== undefined).length.toString(),
      change: "+8%",
      icon: Blocks,
      bg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Avg. Audit Latency",
      value: "2.3s",
      change: "-15%",
      icon: Zap,
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  const recentActivity = assets.slice(0, 6).map((a, i) => ({
    id: a._id || a.id || `act-${i}`,
    type: i % 3 === 0 ? "registration" : i % 3 === 1 ? "verification" : "nft_mint",
    title: a.title,
    time: timeAgo(new Date(a.createdAt)),
    hash: a.fingerprints.sha256,
    contentType: a.contentType,
    txHash: a.blockchain?.txHash,
  }));

  const contentBreakdown = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.contentType] = (acc[a.contentType] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count, percentage: Math.round((count / Math.max(assets.length, 1)) * 100) }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Creator Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Monitor asset registrations, cryptographic proofs, and on-chain verification audits.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/upload" className="btn-primary text-xs py-2.5 px-4 no-underline shadow-xs">
            <Upload className="w-4 h-4" />
            <span>Register Asset</span>
          </Link>
          <Link href="/dashboard/verify" className="btn-secondary text-xs py-2.5 px-4 no-underline">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Verify Proof</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.iconColor} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`badge ${stat.change.startsWith("+") ? "badge-green" : "badge-cyan"} text-[11px]`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Assets & Registrations */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Recent Cryptographic Registrations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest timestamped assets on Polygon Amoy</p>
            </div>
            <Link href="/dashboard/assets" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 no-underline flex items-center gap-1">
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading registered assets...
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No assets registered yet</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">Upload your first creative work to anchor on-chain proof</p>
              <Link href="/dashboard/upload" className="btn-primary text-xs py-2 px-3 no-underline">
                Upload Asset
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => {
                const IconComp = CONTENT_ICONS[item.contentType] || FileText;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{shortenHash(item.hash, 12)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="badge badge-green text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Anchored
                      </span>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Breakdown & Network Status */}
        <div className="space-y-6">
          {/* Content Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Content Breakdown
            </h2>
            {contentBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500">No content data available</p>
            ) : (
              <div className="space-y-3">
                {contentBreakdown.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{item.type}</span>
                      <span className="text-slate-500 font-semibold">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Infrastructure Health */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Network & Nodes
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                  Polygon Amoy Testnet
                </span>
                <span className="font-mono text-slate-700 font-semibold">Synced #6830</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  Pinata IPFS Gateway
                </span>
                <span className="font-mono text-slate-700 font-semibold">100% Up</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600" />
                  FAISS Vector Engine
                </span>
                <span className="font-mono text-slate-700 font-semibold">Indexed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
