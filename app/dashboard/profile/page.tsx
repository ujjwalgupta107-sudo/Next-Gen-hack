"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Star,
  CheckCircle2,
  Blocks,
  FileKey,
  Copy,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit3,
  Wallet,
  Activity,
  AlertCircle,
  X,
  Lock,
  Sparkles,
  Upload,
} from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { getStoredAssets, type Asset } from "@/app/lib/store";
import { shortenAddress, formatDate } from "@/app/lib/crypto";

export default function ProfilePage() {
  const { user, currentWallet, linkWallet, unlinkWallet, updateProfile, refreshUserData } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editProfileImage, setEditProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formMsg, setFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const stored = await getStoredAssets();
      setAssets(stored);
      try {
        const res = await fetch("/api/auth/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data.logs || []);
        }
      } catch (err) {
        console.error("Activity fetch error:", err);
      }
    }
    loadData();

    if (user) {
      setEditFullName(user.fullName || "");
      setEditBio(user.bio || "");
      setEditProfileImage(user.profileImage || "");
    }
  }, [user]);

  const activeWallet = user?.walletAddress || currentWallet || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

  const stats = [
    { label: "Assets Registered", value: user?.stats?.assets ?? assets.length, icon: Shield, bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Public Audits", value: assets.reduce((s, a) => s + (a.verificationCount || 0), 0), icon: Star, bg: "bg-green-50", color: "text-green-600" },
    { label: "NFTs Minted", value: user?.stats?.nfts ?? assets.filter((a) => a.nftTokenId !== null && a.nftTokenId !== undefined).length, icon: Blocks, bg: "bg-purple-50", color: "text-purple-600" },
    { label: "Reputation Score", value: `${user?.reputationScore ?? 100}/100`, icon: Sparkles, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    setIsSaving(true);

    const payload: any = {
      fullName: editFullName,
      bio: editBio,
      profileImage: editProfileImage,
    };

    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await updateProfile(payload);
    setIsSaving(false);

    if (res.success) {
      setFormMsg({ type: "success", text: "Profile updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setIsEditModalOpen(false), 1200);
    } else {
      setFormMsg({ type: "error", text: res.error || "Failed to update profile" });
    }
  };

  const handleLinkMetaMask = async () => {
    const res = await linkWallet();
    if (!res.success) {
      alert(res.error || "Failed to link MetaMask");
    }
  };

  const handleUnlinkMetaMask = async () => {
    if (confirm("Are you sure you want to unlink your MetaMask wallet?")) {
      const res = await unlinkWallet();
      if (!res.success) {
        alert(res.error || "Failed to unlink wallet");
      }
    }
  };

  const copyWallet = () => {
    navigator.clipboard.writeText(activeWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {user?.fullName || "Creator Account"}
                </h1>
                <span className="badge badge-green text-[10px]">Verified Creator</span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                @{user?.username || "creator"} • {user?.email || "creator@proofvault.ai"}
              </p>
              {user?.bio && <p className="text-xs text-slate-600 mt-2 max-w-md">{user.bio}</p>}
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-secondary text-xs py-2 px-3.5 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Wallet Address Bar */}
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Wallet className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Bound Polygon Wallet:</span>
            <span className="font-mono text-slate-800 font-semibold truncate">{activeWallet}</span>
            <button onClick={copyWallet} className="text-slate-400 hover:text-slate-800 shrink-0">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user?.walletAddress ? (
              <button
                onClick={handleUnlinkMetaMask}
                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1"
              >
                Unlink MetaMask
              </button>
            ) : (
              <button
                onClick={handleLinkMetaMask}
                className="btn-primary text-[11px] py-1.5 px-3"
              >
                Link MetaMask (SIWE)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log / Activity */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Recent Account Security & Registration Activity
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            No recent activity logged.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activities.map((act, i) => (
              <div
                key={act._id || i}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{act.action || act.description || "Activity logged"}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {act.timestamp ? formatDate(act.timestamp) : "Recently"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-icon w-8 h-8 absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Edit Creator Profile
              </h2>

              {formMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    formMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {formMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="input-field"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Creator Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="input-field resize-none"
                    placeholder="Tell other creators about your creative background..."
                  />
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <p className="font-semibold text-slate-700">Change Password (Optional)</p>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field"
                    placeholder="Current Password"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    placeholder="New Password (min 8 chars)"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary flex-1 py-2.5 shadow-xs"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
