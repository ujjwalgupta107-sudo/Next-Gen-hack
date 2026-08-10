"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Search,
  Grid3X3,
  List,
  Filter,
  Image as ImageIcon,
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
import { getStoredAssets, type Asset } from "../../lib/store";
import { shortenHash, formatDate, formatFileSize } from "../../lib/crypto";

const CONTENT_ICONS: Record<string, typeof ImageIcon> = {
  Image: ImageIcon,
  Video: Film,
  Audio: Music,
  "Source Code": Code,
  Document: FileText,
  "Design File": Palette,
  "AI Generated": Brain,
};

const CONTENT_COLORS: Record<string, string> = {
  Image: "bg-blue-50 text-blue-600 border-blue-100",
  Video: "bg-purple-50 text-purple-600 border-purple-100",
  Audio: "bg-green-50 text-green-600 border-green-100",
  "Source Code": "bg-amber-50 text-amber-600 border-amber-100",
  Document: "bg-slate-50 text-slate-600 border-slate-200",
  "Design File": "bg-pink-50 text-pink-600 border-pink-100",
  "AI Generated": "bg-cyan-50 text-cyan-600 border-cyan-100",
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssets() {
      const stored = await getStoredAssets();
      setAssets(stored);
    }
    loadAssets();
  }, []);

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.fingerprints.sha256.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || a.contentType === filterType;
    return matchesSearch && matchesType;
  });

  const contentTypes = ["all", ...new Set(assets.map((a) => a.contentType))];

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <span>Asset Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {filteredAssets.length} digital asset{filteredAssets.length === 1 ? "" : "s"} registered and anchored on Polygon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`btn-icon w-9 h-9 ${viewMode === "grid" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : ""}`}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`btn-icon w-9 h-9 ${viewMode === "list" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : ""}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-10 text-xs"
            placeholder="Search by asset title, SHA-256 hash, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === type
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-900">No assets match your search</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting the filter criteria</p>
            </div>
          ) : (
            filteredAssets.map((asset, i) => {
              const IconComp = CONTENT_ICONS[asset.contentType] || FileText;
              const colorClasses = CONTENT_COLORS[asset.contentType] || "bg-slate-50 text-slate-600 border-slate-200";
              return (
                <motion.div
                  key={asset._id || asset.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  {/* Thumbnail / Header */}
                  <div className={`h-32 ${colorClasses} border-b relative flex items-center justify-center`}>
                    <IconComp className="w-10 h-10 opacity-70" />
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-gray text-[10px] bg-white/90 backdrop-blur-xs shadow-xs">
                        {asset.contentType}
                      </span>
                    </div>
                    {asset.nftTokenId !== null && asset.nftTokenId !== undefined && (
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-purple text-[10px] bg-white/90 backdrop-blur-xs shadow-xs">
                          <Blocks className="w-3 h-3" /> NFT #{asset.nftTokenId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">{asset.title}</h3>
                      <button
                        onClick={() => handleCopy(asset.fingerprints.sha256)}
                        className="hash-display text-[10px] w-full text-left mt-1.5 flex items-center justify-between group hover:border-indigo-200"
                        title="Click to copy hash"
                      >
                        <span className="truncate">{shortenHash(asset.fingerprints.sha256, 12)}</span>
                        <Copy className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Shield className="w-3 h-3 text-green-600" />
                        {asset.verificationCount || 0} verifications
                      </span>
                      <span>{formatDate(asset.createdAt).split(",")[0]}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Asset Name</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                <th className="p-4 text-left text-xs font-semibold text-slate-600 uppercase">SHA-256 Hash</th>
                <th className="p-4 text-center text-xs font-semibold text-slate-600 uppercase">Verifications</th>
                <th className="p-4 text-right text-xs font-semibold text-slate-600 uppercase">Date Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, i) => {
                const IconComp = CONTENT_ICONS[asset.contentType] || FileText;
                return (
                  <tr key={asset._id || asset.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{asset.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-gray text-[10px]">{asset.contentType}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-slate-600">{shortenHash(asset.fingerprints.sha256, 10)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="badge badge-green text-[10px]">{asset.verificationCount || 0}</span>
                    </td>
                    <td className="p-4 text-right text-xs text-slate-500">
                      {formatDate(asset.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
