"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileKey,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Users,
  Loader2,
  Calendar,
  ExternalLink,
  Shield,
} from "lucide-react";
import { ethers } from "ethers";
import { LICENSING_CONTRACT_ADDRESS } from "../../lib/store";

const LICENSES = [
  { id: "lic-1", asset: "Abstract Neon Cityscape", type: "Commercial", licensee: "0x7a3B...4d2F", price: "0.05 MATIC", status: "active", startDate: "2026-07-15", endDate: "2027-07-15", usageCount: 3, usageLimit: 0 },
  { id: "lic-2", asset: "Lo-Fi Hip Hop Beat Pack", type: "Personal", licensee: "0x9c1E...8a3B", price: "0.02 MATIC", status: "active", startDate: "2026-08-01", endDate: "2027-08-01", usageCount: 1, usageLimit: 5 },
  { id: "lic-3", asset: "React Component Library", type: "Exclusive", licensee: "0x5f4D...2c1A", price: "0.10 MATIC", status: "active", startDate: "2026-06-20", endDate: null, usageCount: 0, usageLimit: 0 },
  { id: "lic-4", asset: "Cinematic Drone Footage", type: "Commercial", licensee: "0x2b8A...6e9C", price: "0.15 MATIC", status: "expired", startDate: "2025-08-01", endDate: "2026-08-01", usageCount: 12, usageLimit: 0 },
];

const TYPE_COLORS: Record<string, string> = {
  Personal: "badge-blue",
  Commercial: "badge-green",
  Exclusive: "badge-purple",
};

const STATUS_COLORS: Record<string, string> = {
  active: "badge-green",
  expired: "badge-red",
  pending: "badge-amber",
};

const LICENSING_ABI = ["function withdrawFunds() external"];

export default function LicensesPage() {
  const [tab, setTab] = useState<"issued" | "purchased">("issued");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  const filtered = filterStatus === "all" ? LICENSES : LICENSES.filter((l) => l.status === filterStatus);

  const handleWithdrawFunds = async () => {
    setIsWithdrawing(true);
    setWithdrawMsg(null);
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(LICENSING_CONTRACT_ADDRESS, LICENSING_ABI, signer);
        const tx = await contract.withdrawFunds();
        await tx.wait();
        setWithdrawMsg(`Withdrawn successfully on Polygon Amoy! Tx: ${tx.hash.slice(0, 10)}...`);
      } else {
        setWithdrawMsg("Connect MetaMask on Polygon Amoy to withdraw earnings.");
      }
    } catch (err: any) {
      console.warn(err);
      setWithdrawMsg("No pending earnings to withdraw or transaction rejected.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileKey className="w-4 h-4" />
            </div>
            <span>License Management & Pull-Withdrawals</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manage commercial licensing terms, view active licenses, and withdraw accumulated smart contract earnings.
          </p>
        </div>
        <button
          onClick={handleWithdrawFunds}
          disabled={isWithdrawing}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 shadow-xs shrink-0"
        >
          {isWithdrawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <DollarSign className="w-3.5 h-3.5" />}
          <span>Withdraw Revenue (0.32 MATIC)</span>
        </button>
      </div>

      {withdrawMsg && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl p-3.5 text-xs font-semibold shadow-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{withdrawMsg}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Licenses", value: "23", icon: CheckCircle2, bg: "bg-green-50", color: "text-green-600" },
          { label: "Accumulated Revenue", value: "0.32 MATIC", icon: DollarSign, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Total Licensees", value: "18", icon: Users, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "Expiring in 30d", value: "3", icon: AlertCircle, bg: "bg-amber-50", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
            </div>
            <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-4">
          {(["issued", "purchased"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-xs font-semibold border-b-2 transition-all capitalize ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {t === "issued" ? "Licenses Issued by You" : "Licenses Purchased"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {["all", "active", "expired"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Licensed Asset</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">License Tier</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Licensee</th>
              <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Price Paid</th>
              <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase">Valid Until</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lic) => (
              <tr key={lic.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">{lic.asset}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`badge ${TYPE_COLORS[lic.type]} text-[10px]`}>{lic.type}</span>
                </td>
                <td className="p-4 font-mono text-xs text-slate-600">
                  {lic.licensee}
                </td>
                <td className="p-4 text-xs font-bold text-slate-900">
                  {lic.price}
                </td>
                <td className="p-4 text-center">
                  <span className={`badge ${STATUS_COLORS[lic.status]} text-[10px] capitalize`}>{lic.status}</span>
                </td>
                <td className="p-4 text-right text-xs text-slate-500">
                  {lic.endDate || "Perpetual"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
