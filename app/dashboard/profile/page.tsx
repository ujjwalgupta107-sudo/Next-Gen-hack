'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { getStoredAssets, type Asset } from '@/app/lib/store';
import { shortenAddress, formatDate } from '@/app/lib/crypto';

export default function ProfilePage() {
  const { user, currentWallet, linkWallet, unlinkWallet, updateProfile, refreshUserData } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const stored = await getStoredAssets();
      setAssets(stored);
      try {
        const res = await fetch('/api/auth/activity');
        if (res.ok) {
          const data = await res.json();
          setActivities(data.logs || []);
        }
      } catch (err) {
        console.error('Activity fetch error:', err);
      }
    }
    loadData();

    if (user) {
      setEditFullName(user.fullName || '');
      setEditBio(user.bio || '');
      setEditProfileImage(user.profileImage || '');
    }
  }, [user]);

  const activeWallet = user?.walletAddress || currentWallet || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  const stats = [
    { label: 'Assets Registered', value: user?.stats?.assets ?? assets.length, icon: Shield },
    { label: 'Verifications', value: assets.reduce((s, a) => s + (a.verificationCount || 0), 0), icon: Star },
    { label: 'NFTs Minted', value: user?.stats?.nfts ?? assets.filter((a) => a.nftTokenId !== null).length, icon: Blocks },
    { label: 'Reputation Score', value: user?.reputationScore ?? 100, icon: Sparkles },
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
      setFormMsg({ type: 'success', text: 'Profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setIsEditModalOpen(false), 1200);
    } else {
      setFormMsg({ type: 'error', text: res.error || 'Failed to update profile' });
    }
  };

  const handleLinkMetaMask = async () => {
    const res = await linkWallet();
    if (!res.success) {
      alert(res.error || 'Failed to link MetaMask');
    }
  };

  const handleUnlinkMetaMask = async () => {
    if (confirm('Are you sure you want to unlink your MetaMask wallet?')) {
      const res = await unlinkWallet();
      if (!res.success) {
        alert(res.error || 'Failed to unlink wallet');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Profile Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner */}
        <div className="h-36 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Avatar & User Details */}
        <div className="px-6 pb-6 -mt-14 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 border-4 border-slate-950 flex items-center justify-center shadow-xl overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white font-mono">
                    {user?.fullName || 'Creator Profile'}
                  </h2>
                  {user?.verified && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/50 text-cyan-300 uppercase tracking-wider">
                    {user?.role || 'creator'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-0.5">@{user?.username || 'unregistered'}</p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-mono text-slate-400">{shortenAddress(activeWallet)}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeWallet);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="py-2 px-3.5 rounded-xl border border-slate-700 hover:border-cyan-500 bg-slate-950 text-xs font-semibold text-white flex items-center gap-2 transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                Edit Profile
              </button>

              {user?.walletAddress ? (
                <button
                  onClick={handleUnlinkMetaMask}
                  className="py-2 px-3.5 rounded-xl border border-red-900/50 hover:border-red-600 bg-red-950/30 text-xs font-semibold text-red-300 transition"
                >
                  Unlink Wallet
                </button>
              ) : (
                <button
                  onClick={handleLinkMetaMask}
                  className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Link MetaMask
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-300 leading-relaxed">
              {user?.bio || 'Decentralized digital creator protecting IP and perceptual assets on ProofVault AI.'}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'August 2026'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Polygon Amoy Testnet
              </span>
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5" /> proofvault.ai
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-md"
          >
            <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
            <div className="text-xl font-bold text-white font-mono">{stat.value}</div>
            <div className="text-[11px] text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Activity Logs */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          Recent Security & Ownership Activity
        </h3>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No recent activity logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {activities.slice(0, 6).map((act, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200 capitalize">{act.action.replace('_', ' ')}</div>
                  <div className="text-[11px] text-slate-500">{act.description}</div>
                </div>
                <div className="text-right text-[10px] text-slate-500 font-mono">
                  {new Date(act.timestamp).toLocaleTimeString()} · {new Date(act.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-white mb-4">Edit Profile & Security</h2>

              {formMsg && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                    formMsg.type === 'success'
                      ? 'bg-green-950/40 border border-green-800 text-green-300'
                      : 'bg-red-950/40 border border-red-800 text-red-300'
                  }`}
                >
                  {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{formMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Profile Image URL</label>
                  <input
                    type="text"
                    value={editProfileImage}
                    onChange={(e) => setEditProfileImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Change Password (Optional)
                  </div>
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
