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
  Image,
  Music,
  Code,
  FileText,
  Film,
  Palette,
  Brain,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { getStoredAssets, generateMockAssets, MOCK_STATS, type Asset } from "../lib/store";
import { shortenHash, shortenAddress, formatDate, formatFileSize, timeAgo } from "../lib/crypto";

const CONTENT_ICONS: Record<string, typeof Image> = {
  Image: Image,
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
      label: "Total Assets",
      value: assets.length.toString(),
      change: "+12%",
      icon: Shield,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Verifications",
      value: assets.reduce((s, a) => s + a.verificationCount, 0).toString(),
      change: "+24%",
      icon: FileCheck,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "NFTs Minted",
      value: assets.filter((a) => a.nftTokenId !== null && a.nftTokenId !== undefined).length.toString(),
      change: "+8%",
      icon: Blocks,
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      label: "Avg. Processing",
      value: "2.3s",
      change: "-15%",
      icon: Zap,
      gradient: "from-green-500 to-green-600",
    },
  ];

  const recentActivity = assets.slice(0, 5).map((a, i) => ({
    id: a._id || a.id || `act-${i}`,
    type: i % 3 === 0 ? "registration" : i % 3 === 1 ? "verification" : "nft_mint",
    title: a.title,
    time: timeAgo(new Date(a.createdAt)),
    hash: a.fingerprints.sha256,
  }));

  const contentBreakdown = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.contentType] = (acc[a.contentType] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count, percentage: Math.round((count / Math.max(assets.length, 1)) * 100) }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Welcome back! 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here&apos;s what&apos;s happening with your digital assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/upload" className="btn-primary no-underline">
            <Upload className="w-4 h-4" />
            Register Asset
          </Link>
          <Link href="/dashboard/verify" className="btn-secondary no-underline">
            <Search className="w-4 h-4" />
            Verify
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${stat.change.startsWith("+") ? "text-green-400" : "text-cyan-400"}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Recent Activity
            </h2>
            <Link href="/dashboard/assets" className="text-sm text-blue-400 hover:text-blue-300 no-underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === "registration"
                      ? "bg-blue-500/10 text-blue-400"
                      : item.type === "verification"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-purple-500/10 text-purple-400"
                  }`}
                >
                  {item.type === "registration" ? (
                    <Upload className="w-4 h-4" />
                  ) : item.type === "verification" ? (
                    <FileCheck className="w-4 h-4" />
                  ) : (
                    <Blocks className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono truncate">
                    {shortenHash(item.hash, 12)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`badge text-[10px] ${
                      item.type === "registration"
                        ? "badge-blue"
                        : item.type === "verification"
                        ? "badge-green"
                        : "badge-purple"
                    }`}
                  >
                    {item.type === "registration" ? "Registered" : item.type === "verification" ? "Verified" : "NFT Minted"}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">{item.time}</p>
                </div>
              </motion.div>
            ))}

            {recentActivity.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No activity yet. Register your first asset!</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Content Breakdown
          </h2>

          <div className="space-y-4">
            {contentBreakdown.map((item, i) => {
              const IconComp = CONTENT_ICONS[item.type] || FileText;
              return (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComp className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{item.type}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{item.count}</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Upload New Asset", href: "/dashboard/upload", icon: Upload },
                { label: "Verify Ownership", href: "/dashboard/verify", icon: Search },
                { label: "View NFT Gallery", href: "/dashboard/nft", icon: Image },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors text-sm text-[var(--text-secondary)] hover:text-white no-underline"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  <ArrowUpRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assets Grid */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Recent Registrations
          </h2>
          <Link href="/dashboard/assets" className="text-sm text-blue-400 hover:text-blue-300 no-underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="hidden sm:table-cell">Type</th>
                <th className="hidden md:table-cell">Hash</th>
                <th className="hidden lg:table-cell">Block</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {assets.slice(0, 6).map((asset, i) => {
                const IconComp = CONTENT_ICONS[asset.contentType] || FileText;
                return (
                  <motion.tr
                    key={asset._id || asset.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                          <IconComp className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                        <span className="font-medium text-white truncate max-w-[200px]">{asset.title}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="badge badge-blue text-[10px]">{asset.contentType}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="hash-display text-[11px]">{shortenHash(asset.fingerprints.sha256)}</span>
                    </td>
                    <td className="hidden lg:table-cell font-mono text-xs">{asset.blockchain.blockNumber.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-green text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Registered
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-xs">{formatDate(new Date(asset.createdAt))}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
