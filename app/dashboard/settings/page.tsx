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
    darkMode: true,
  });

  useEffect(() => {
    setWallet(getConnectedWallet() || "0x0000...0000");
  }, []);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] as boolean }));
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
        checked ? "bg-blue-500" : "bg-white/10"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px]"
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <SettingsIcon className="w-6 h-6 text-[var(--text-muted)]" />
          Settings
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account preferences and security</p>
      </div>

      {/* Wallet Section */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-blue-400" />
          Connected Wallet
        </h3>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-sm text-white flex-1">{wallet}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(wallet); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="btn-icon w-8 h-8"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="badge badge-green text-[10px]">Polygon</span>
          <span className="badge badge-blue text-[10px]">MetaMask</span>
        </div>
      </div>

      {/* Subscription */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-amber-400" />
          Subscription Plan
        </h3>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div>
            <span className="badge badge-blue mb-2">Pro Plan</span>
            <p className="text-sm text-[var(--text-secondary)]">Unlimited registrations & verifications</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">$29<span className="text-sm text-[var(--text-muted)]">/mo</span></p>
            <p className="text-xs text-[var(--text-muted)]">Renews Sep 6, 2026</p>
          </div>
        </div>
        <button className="btn-secondary w-full mt-3 text-sm">Manage Subscription</button>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-green-400" />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: "registration" as const, label: "Registration Complete", desc: "When your asset is confirmed on blockchain" },
            { key: "verification" as const, label: "Verification Matches", desc: "When someone verifies your content" },
            { key: "marketplace" as const, label: "Marketplace Activity", desc: "Sales, offers, and price changes" },
            { key: "disputes" as const, label: "Dispute Alerts", desc: "When a dispute is raised on your assets" },
            { key: "newsletter" as const, label: "Newsletter", desc: "Product updates and feature announcements" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <ToggleSwitch checked={notifications[item.key]} onChange={() => toggleNotification(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-purple-400" />
          Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: "autoMintNFT" as const, label: "Auto-Mint NFT", desc: "Automatically mint a Proof NFT on every registration" },
            { key: "publicProfile" as const, label: "Public Profile", desc: "Allow others to view your creator profile" },
            { key: "showReputation" as const, label: "Show Reputation", desc: "Display reputation score on your profile" },
            { key: "darkMode" as const, label: "Dark Mode", desc: "Use dark theme (recommended)" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
              </div>
              <ToggleSwitch checked={preferences[item.key] as boolean} onChange={() => togglePreference(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-cyan-400" />
          API Keys
        </h3>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">Production Key</span>
            <span className="badge badge-green text-[10px]">Active</span>
          </div>
          <div className="hash-display text-xs">pvai_prod_sk_7a3b4d2f9c1e8a3b5f4d2c1a...</div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Created Aug 1, 2026 • 1,847 / 10,000 calls used</p>
        </div>
        <button className="btn-secondary w-full mt-3 text-sm">
          <Key className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-500/20">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl border border-red-500/10">
            <div>
              <p className="text-sm text-white">Delete Account</p>
              <p className="text-xs text-[var(--text-muted)]">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
