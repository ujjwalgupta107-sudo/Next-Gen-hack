"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileKey,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  Copy,
  ExternalLink,
  Filter,
} from "lucide-react";
import { shortenHash, shortenAddress } from "../../lib/crypto";

const LICENSES = [
  { id: "lic-1", asset: "Abstract Neon Cityscape", type: "Commercial", licensee: "0x7a3B...4d2F", price: "0.5 MATIC", status: "active", startDate: "2026-07-15", endDate: "2027-07-15", usageCount: 3, usageLimit: 0 },
  { id: "lic-2", asset: "Lo-Fi Hip Hop Beat Pack", type: "Personal", licensee: "0x9c1E...8a3B", price: "0.2 MATIC", status: "active", startDate: "2026-08-01", endDate: "2027-08-01", usageCount: 1, usageLimit: 5 },
  { id: "lic-3", asset: "React Component Library", type: "Exclusive", licensee: "0x5f4D...2c1A", price: "5.0 MATIC", status: "active", startDate: "2026-06-20", endDate: null, usageCount: 0, usageLimit: 0 },
  { id: "lic-4", asset: "Cinematic Drone Footage", type: "Royalty", licensee: "0x2b8A...6e9C", price: "1.0 MATIC", status: "expired", startDate: "2025-08-01", endDate: "2026-08-01", usageCount: 12, usageLimit: 0 },
  { id: "lic-5", asset: "Brand Identity Design", type: "Commercial", licensee: "0x8e2C...9f4A", price: "2.0 MATIC", status: "pending", startDate: "2026-08-06", endDate: "2027-08-06", usageCount: 0, usageLimit: 10 },
];

const TYPE_COLORS: Record<string, string> = {
  Personal: "badge-blue",
  Commercial: "badge-green",
  Exclusive: "badge-purple",
  Royalty: "badge-amber",
};

const STATUS_COLORS: Record<string, string> = {
  active: "badge-green",
  expired: "badge-red",
  pending: "badge-amber",
};

export default function LicensesPage() {
  const [tab, setTab] = useState<"issued" | "purchased">("issued");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = filterStatus === "all" ? LICENSES : LICENSES.filter((l) => l.status === filterStatus);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <FileKey className="w-6 h-6 text-green-400" />
          License Center
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage licensing terms for your digital assets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Licenses", value: "23", icon: CheckCircle2, color: "text-green-400" },
          { label: "Revenue", value: "45.6 MATIC", icon: DollarSign, color: "text-blue-400" },
          { label: "Licensees", value: "18", icon: Users, color: "text-purple-400" },
          { label: "Expiring Soon", value: "3", icon: AlertCircle, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-xl font-bold text-white">{s.value}</div>
            <div className="text-[11px] text-[var(--text-muted)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-0">
        {(["issued", "purchased"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 transition-all capitalize ${
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {t === "issued" ? "Licenses Issued" : "Licenses Purchased"}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {["all", "active", "pending", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filterStatus === s
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                : "text-[var(--text-muted)] hover:text-white bg-white/[0.02] border border-transparent"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {/* License List */}
      <div className="space-y-3">
        {filtered.map((license, i) => (
          <motion.div
            key={license.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <FileKey className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{license.asset}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`badge ${TYPE_COLORS[license.type]} text-[10px]`}>{license.type}</span>
                    <span className={`badge ${STATUS_COLORS[license.status]} text-[10px] capitalize`}>{license.status}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{license.licensee}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-[var(--text-muted)] text-[11px]">Price</p>
                  <p className="font-semibold text-white">{license.price}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[var(--text-muted)] text-[11px]">Usage</p>
                  <p className="text-white">{license.usageCount}{license.usageLimit > 0 ? `/${license.usageLimit}` : "/∞"}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[var(--text-muted)] text-[11px]">Expires</p>
                  <p className="text-white text-xs">{license.endDate || "Perpetual"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* License Types Info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">License Types</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: "Personal", desc: "Non-commercial, single user use", price: "From 0.1 MATIC" },
            { type: "Commercial", desc: "Full commercial rights for business use", price: "From 0.5 MATIC" },
            { type: "Exclusive", desc: "Sole licensee, no other licenses issued", price: "From 5.0 MATIC" },
            { type: "Royalty", desc: "Revenue sharing on derivative works", price: "5% royalty" },
          ].map((t) => (
            <div key={t.type} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className={`badge ${TYPE_COLORS[t.type]} text-[10px] mb-3`}>{t.type}</span>
              <p className="text-xs text-[var(--text-secondary)] mb-2">{t.desc}</p>
              <p className="text-xs font-semibold text-white">{t.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
