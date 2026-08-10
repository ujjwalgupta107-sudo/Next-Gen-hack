"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Wallet,
  Bell,
  Shield,
  Key,
  Globe,
  Palette,
  Database,
  Code,
  Copy,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Blocks,
  Zap,
} from "lucide-react";
import { getConnectedWallet } from "../../lib/store";
import { shortenAddress } from "../../lib/crypto";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] shadow-xs"
      />
    </button>
  );
}

export default function SettingsPage() {
  const [wallet, setWallet] = useState("");
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState({
    registration: true,
    verification: true,
    marketplace: false,
    disputes: true,
    newsletter: false,
  });
  const [preferences, setPreferences] = useState({
    autoMintNFT: false,
    defaultLicense: "commercial",
    publicProfile: true,
    showReputation: true,
    darkMode: false,
  });

  useEffect(() => {
    async function initWallet() {
      const w = await getConnectedWallet();
      setWallet(w || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    }
    initWallet();
  }, []);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] as boolean }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <span>Account Preferences & Security</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure on-chain wallet bindings, notification dispatches, and creator defaults.
        </p>
      </div>

      {/* Connected Wallet Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-indigo-600" />
          <span>Connected Polygon Wallet</span>
        </h3>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 flex-1 truncate">{wallet}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(wallet);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="btn-icon w-8 h-8"
            title="Copy wallet address"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-purple text-[10px]">Polygon Amoy</span>
          <span className="badge badge-blue text-[10px]">MetaMask (SIWE)</span>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Subscription Tier</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 gap-3">
          <div>
            <span className="badge badge-blue mb-1 text-[10px]">Pro Studio Plan</span>
            <p className="text-xs text-slate-600">Unlimited registrations, similarity checks & 50 GB IPFS storage</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              $29<span className="text-xs text-slate-500 font-normal">/mo</span>
            </p>
            <p className="text-[11px] text-slate-500">Renews Oct 15, 2026</p>
          </div>
        </div>
        <button className="btn-secondary w-full text-xs py-2.5">Manage Subscription & Invoices</button>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-green-600" />
          <span>Notification Preferences</span>
        </h3>
        <div className="divide-y divide-slate-100">
          {[
            { key: "registration" as const, label: "Registration Confirmations", desc: "Alert when on-chain transactions are mined on Polygon" },
            { key: "verification" as const, label: "Verification Audit Alerts", desc: "Notification when someone audits your creative fingerprints" },
            { key: "marketplace" as const, label: "Marketplace License Sales", desc: "Instant alert when commercial licenses are purchased" },
            { key: "disputes" as const, label: "Infringement & Near-Match Alerts", desc: "Alert when a near-duplicate asset is detected" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch
                checked={notifications[item.key]}
                onChange={() => toggleNotification(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Automation Defaults */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Creator Automation Defaults</span>
        </h3>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Auto-Mint ERC-721 Proof NFT</p>
              <p className="text-[11px] text-slate-500">Automatically mint NFT alongside blockchain hash registration</p>
            </div>
            <ToggleSwitch
              checked={preferences.autoMintNFT}
              onChange={() => togglePreference("autoMintNFT")}
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Public Verification Directory</p>
              <p className="text-[11px] text-slate-500">Allow other creators to search your public authorship claims</p>
            </div>
            <ToggleSwitch
              checked={preferences.publicProfile}
              onChange={() => togglePreference("publicProfile")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
