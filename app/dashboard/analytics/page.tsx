"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Upload,
  Search,
  Blocks,
  FileKey,
  DollarSign,
  Users,
  Activity,
  Calendar,
  ArrowUpRight,
} from "lucide-react";

// Simple chart component using div bars
function BarChart({ data, color = "blue" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    cyan: "from-cyan-500 to-cyan-600",
  };

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)]">{d.value}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className={`w-full rounded-t-md bg-gradient-to-t ${colorMap[color]} min-h-[4px]`}
          />
          <span className="text-[10px] text-[var(--text-muted)] truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniLineChart({ data, color = "#3b82f6" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  const registrationData = [
    { label: "Mon", value: 45 }, { label: "Tue", value: 52 },
    { label: "Wed", value: 38 }, { label: "Thu", value: 67 },
    { label: "Fri", value: 72 }, { label: "Sat", value: 43 },
    { label: "Sun", value: 58 },
  ];

  const verificationData = [
    { label: "Mon", value: 124 }, { label: "Tue", value: 98 },
    { label: "Wed", value: 156 }, { label: "Thu", value: 189 },
    { label: "Fri", value: 201 }, { label: "Sat", value: 134 },
    { label: "Sun", value: 167 },
  ];

  const kpis = [
    { label: "Total Registrations", value: "12,847", change: "+12.5%", up: true, icon: Upload, color: "text-blue-400", sparkline: [20, 25, 22, 30, 28, 35, 40, 38, 45, 42, 48, 52] },
    { label: "Total Verifications", value: "89,245", change: "+24.3%", up: true, icon: Search, color: "text-green-400", sparkline: [50, 55, 48, 60, 58, 65, 70, 68, 75, 80, 85, 89] },
    { label: "NFTs Minted", value: "3,421", change: "+8.7%", up: true, icon: Blocks, color: "text-purple-400", sparkline: [10, 12, 11, 15, 14, 18, 20, 19, 22, 25, 28, 34] },
    { label: "License Revenue", value: "456 MATIC", change: "+31.2%", up: true, icon: DollarSign, color: "text-cyan-400", sparkline: [5, 8, 7, 12, 15, 20, 18, 25, 30, 35, 40, 45] },
    { label: "Unique Creators", value: "2,891", change: "+15.8%", up: true, icon: Users, color: "text-amber-400", sparkline: [30, 32, 35, 34, 38, 40, 42, 45, 48, 50, 55, 58] },
    { label: "Avg Processing", value: "2.3s", change: "-15.4%", up: false, icon: Activity, color: "text-pink-400", sparkline: [5, 4.5, 4.8, 4, 3.5, 3.8, 3.2, 3, 2.8, 2.5, 2.4, 2.3] },
  ];

  const topAssets = [
    { title: "Abstract Neon Cityscape", verifications: 234, type: "Image" },
    { title: "React Component Library", verifications: 189, type: "Source Code" },
    { title: "Sonic Wave Music Album", verifications: 156, type: "Audio" },
    { title: "ML Pipeline v2.0", verifications: 134, type: "Source Code" },
    { title: "Brand Identity Design", verifications: 98, type: "Design File" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Analytics
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track your digital asset protection metrics</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
          {["7d", "30d", "90d", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p ? "bg-blue-500/20 text-blue-400" : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between mb-3">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs font-semibold flex items-center gap-1 ${kpi.up ? "text-green-400" : "text-cyan-400"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{kpi.label}</span>
              <MiniLineChart data={kpi.sparkline} color={kpi.color === "text-blue-400" ? "#3b82f6" : kpi.color === "text-green-400" ? "#10b981" : kpi.color === "text-purple-400" ? "#8b5cf6" : kpi.color === "text-cyan-400" ? "#06b6d4" : kpi.color === "text-amber-400" ? "#f59e0b" : "#ec4899"} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registrations Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            Registrations This Week
          </h3>
          <BarChart data={registrationData} color="blue" />
        </div>

        {/* Verifications Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Search className="w-4 h-4 text-green-400" />
            Verifications This Week
          </h3>
          <BarChart data={verificationData} color="green" />
        </div>
      </div>

      {/* Top Assets */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          Most Verified Assets
        </h3>
        <div className="space-y-3">
          {topAssets.map((asset, i) => (
            <div key={asset.title} className="flex items-center gap-4 py-2">
              <span className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-xs text-[var(--text-muted)] font-bold shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{asset.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{asset.type}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-white">{asset.verifications}</p>
                <p className="text-[10px] text-[var(--text-muted)]">verifications</p>
              </div>
              <div className="progress-bar w-24 hidden sm:block">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(asset.verifications / topAssets[0].verifications) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
