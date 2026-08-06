"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Search,
  Grid3X3,
  List,
  Filter,
  Image,
  Film,
  Music,
  Code,
  FileText,
  Palette,
  Brain,
  Shield,
  CheckCircle2,
  Blocks,
  ExternalLink,
  Copy,
  MoreVertical,
} from "lucide-react";
import { getStoredAssets, generateMockAssets, type Asset } from "../../lib/store";
import { shortenHash, formatDate, formatFileSize } from "../../lib/crypto";

const CONTENT_ICONS: Record<string, typeof Image> = {
  Image, Video: Film, Audio: Music, "Source Code": Code,
  Document: FileText, "Design File": Palette, "AI Generated": Brain,
};

const CONTENT_COLORS: Record<string, string> = {
  Image: "from-blue-500 to-cyan-500",
  Video: "from-purple-500 to-pink-500",
  Audio: "from-green-500 to-cyan-500",
  "Source Code": "from-amber-500 to-orange-500",
  Document: "from-gray-500 to-gray-600",
  "Design File": "from-pink-500 to-purple-500",
  "AI Generated": "from-cyan-500 to-blue-500",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const stored = getStoredAssets();
    setAssets(stored.length > 0 ? stored : generateMockAssets());
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fingerprints.sha256.includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || a.contentType === filterType;
    return matchesSearch && matchesType;
  });

  const contentTypes = ["all", ...new Set(assets.map((a) => a.contentType))];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <FolderOpen className="w-6 h-6 text-blue-400" />
            Asset Library
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{filteredAssets.length} registered assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("grid")} className={`btn-icon ${viewMode === "grid" ? "border-blue-500/40 text-blue-400" : ""}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`btn-icon ${viewMode === "list" ? "border-blue-500/40 text-blue-400" : ""}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            className="glass-input pl-10"
            placeholder="Search by title, hash, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterType === type
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                  : "text-[var(--text-muted)] hover:text-white bg-white/[0.02] border border-transparent"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map((asset, i) => {
            const IconComp = CONTENT_ICONS[asset.contentType] || FileText;
            const gradient = CONTENT_COLORS[asset.contentType] || "from-gray-500 to-gray-600";
            return (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card overflow-hidden group"
              >
                {/* Preview Area */}
                <div className={`h-36 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                  <IconComp className="w-12 h-12 text-white/40" />
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-blue text-[10px] backdrop-blur-sm bg-black/30 border-white/10">
                      {asset.contentType}
                    </span>
                  </div>
                  {asset.nftTokenId !== null && (
                    <div className="absolute top-3 left-3">
                      <span className="badge badge-purple text-[10px] backdrop-blur-sm bg-black/30 border-white/10">
                        <Blocks className="w-3 h-3" /> NFT
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-white truncate mb-1">{asset.title}</h3>
                  <div className="hash-display text-[10px] mb-3">{shortenHash(asset.fingerprints.sha256, 12)}</div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {asset.verificationCount} verifications
                    </span>
                    <span>{formatDate(new Date(asset.createdAt)).split(",")[0]}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th className="hidden sm:table-cell">Type</th>
                <th className="hidden md:table-cell">Hash</th>
                <th className="hidden lg:table-cell">Size</th>
                <th>Status</th>
                <th className="hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, i) => {
                const IconComp = CONTENT_ICONS[asset.contentType] || FileText;
                return (
                  <motion.tr
                    key={asset.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                          <IconComp className="w-4 h-4 text-[var(--text-muted)]" />
                        </div>
                        <span className="font-medium text-white truncate max-w-[180px]">{asset.title}</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="badge badge-blue text-[10px]">{asset.contentType}</span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="hash-display text-[10px]">{shortenHash(asset.fingerprints.sha256)}</span>
                    </td>
                    <td className="hidden lg:table-cell text-xs">{formatFileSize(asset.fileMetadata.size)}</td>
                    <td>
                      <span className="badge badge-green text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Registered
                      </span>
                    </td>
                    <td className="hidden sm:table-cell text-xs">{formatDate(new Date(asset.createdAt)).split(",")[0]}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No assets found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
