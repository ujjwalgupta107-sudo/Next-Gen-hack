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

// Light-themed responsive bar chart
function LightBarChart({ data, color = "indigo" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
    cyan: "bg-cyan-600",
  };

  return (
    <div className="flex items-end gap-2 sm:gap-3 h-44 pt-6">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <span className="text-[10px] font-mono font-semibold text-slate-600">{d.value}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className={`w-full rounded-t-md ${colorMap[color]} min-h-[6px] hover:opacity-90 transition-opacity`}
          />
          <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MiniSparkline({ data, color = "#4f46e5" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 32;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
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
    { label: "Mon", value: 45 },
    { label: "Tue", value: 52 },
    { label: "Wed", value: 38 },
    { label: "Thu", value: 67 },
    { label: "Fri", value: 72 },
    { label: "Sat", value: 43 },
    { label: "Sun", value: 58 },
  ];

  const verificationData = [
    { label: "Mon", value: 124 },
    { label: "Tue", value: 98 },
    { label: "Wed", value: 156 },
    { label: "Thu", value: 189 },
    { label: "Fri", value: 201 },
    { label: "Sat", value: 134 },
    { label: "Sun", value: 167 },
  ];

  const kpis = [
    { label: "Total Registrations", value: "12,847", change: "+12.5%", up: true, icon: Upload, color: "text-indigo-600", bg: "bg-indigo-50", sparkline: [20, 25, 22, 30, 28, 35, 40, 38, 45, 42, 48, 52] },
    { label: "Total Verifications", value: "89,245", change: "+24.3%", up: true, icon: Search, color: "text-green-600", bg: "bg-green-50", sparkline: [50, 55, 48, 60, 58, 65, 70, 68, 75, 80, 85, 89] },
    { label: "NFT Proofs Minted", value: "3,421", change: "+8.7%", up: true, icon: Blocks, color: "text-purple-600", bg: "bg-purple-50", sparkline: [10, 12, 11, 15, 14, 18, 20, 19, 22, 25, 28, 34] },
    { label: "License Revenue", value: "456 MATIC", change: "+31.2%", up: true, icon: DollarSign, color: "text-cyan-600", bg: "bg-cyan-50", sparkline: [5, 8, 7, 12, 15, 20, 18, 25, 30, 35, 40, 45] },
    { label: "Unique Creators", value: "2,891", change: "+15.8%", up: true, icon: Users, color: "text-amber-600", bg: "bg-amber-50", sparkline: [30, 32, 35, 34, 38, 40, 42, 45, 48, 50, 55, 58] },
    { label: "Avg Audit Latency", value: "2.3s", change: "-15.4%", up: false, icon: Activity, color: "text-pink-600", bg: "bg-pink-50", sparkline: [5, 4.5, 4.8, 4, 3.5, 3.8, 3.2, 3, 2.8, 2.5, 2.4, 2.3] },
  ];

  const topAssets = [
    { title: "Abstract Neon Cityscape", verifications: 234, type: "Image" },
    { title: "React Component Library", verifications: 189, type: "Source Code" },
    { title: "Sonic Wave Music Album", verifications: 156, type: "Audio" },
    { title: "ML Pipeline v2.0", verifications: 134, type: "Source Code" },
    { title: "Brand Identity Design", verifications: 98, type: "Design File" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span>Platform Analytics & Audit Metrics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time telemetry on cryptographic hash registrations, vector similarities, and licensing volume.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {["7d", "30d", "90d", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                period === p
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className={`badge ${kpi.up ? "badge-green" : "badge-cyan"} text-[10px]`}>
                {kpi.change}
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">{kpi.label}</div>
              </div>
              <div className="hidden sm:block">
                <MiniSparkline data={kpi.sparkline} color="#4f46e5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Registrations Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asset Registrations</h3>
              <p className="text-xs text-slate-500">Daily smart contract commitments</p>
            </div>
            <span className="badge badge-blue text-[10px]">Weekly Trend</span>
          </div>
          <LightBarChart data={registrationData} color="indigo" />
        </div>

        {/* Verifications Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ownership Verifications</h3>
              <p className="text-xs text-slate-500">Public & automated verification audits</p>
            </div>
            <span className="badge badge-green text-[10px]">Weekly Trend</span>
          </div>
          <LightBarChart data={verificationData} color="green" />
        </div>
      </div>

      {/* Top Assets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Most Frequently Audited Assets</h3>
        <div className="space-y-3">
          {topAssets.map((asset, i) => (
            <div
              key={asset.title}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 font-bold w-4">{i + 1}</span>
                <span className="font-bold text-slate-900">{asset.title}</span>
                <span className="badge badge-gray text-[10px] hidden sm:inline">{asset.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <span className="font-bold text-slate-900">{asset.verifications}</span>
                <span className="text-slate-500 text-[11px]">checks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
