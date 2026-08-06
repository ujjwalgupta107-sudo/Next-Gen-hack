"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Blocks,
  ExternalLink,
  Heart,
  Eye,
  ArrowLeftRight,
  Shield,
  Tag,
  Clock,
  Sparkles,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { shortenAddress, shortenHash } from "../../lib/crypto";

const NFTS = [
  { id: 1, tokenId: 42, title: "Digital Cosmos #42", creator: "0x7a3B...4d2F", price: "2.5", rarity: "Legendary", gradient: "from-purple-600 via-blue-600 to-cyan-500", likes: 124, editions: "1/1", chain: "Polygon" },
  { id: 2, tokenId: 187, title: "Neural Dreams #187", creator: "0x9c1E...8a3B", price: "1.2", rarity: "Epic", gradient: "from-pink-600 to-purple-700", likes: 87, editions: "3/10", chain: "Polygon" },
  { id: 3, tokenId: 256, title: "Code Genesis #256", creator: "0x5f4D...2c1A", price: "0.8", rarity: "Rare", gradient: "from-amber-500 to-red-600", likes: 56, editions: "5/25", chain: "Polygon" },
  { id: 4, tokenId: 512, title: "Sonic Wave #512", creator: "0x2b8A...6e9C", price: "3.0", rarity: "Legendary", gradient: "from-green-500 to-cyan-600", likes: 203, editions: "1/1", chain: "Polygon" },
  { id: 5, tokenId: 73, title: "Abstract Protocol #73", creator: "0x1d7F...3b5E", price: "0.5", rarity: "Common", gradient: "from-gray-500 to-blue-600", likes: 34, editions: "10/50", chain: "Polygon" },
  { id: 6, tokenId: 891, title: "Quantum Art #891", creator: "0x8e2C...9f4A", price: "5.0", rarity: "Mythic", gradient: "from-yellow-400 via-red-500 to-purple-600", likes: 312, editions: "1/1", chain: "Polygon" },
  { id: 7, tokenId: 144, title: "Pixel Harmony #144", creator: "0x4a6B...1d8C", price: "1.5", rarity: "Epic", gradient: "from-blue-500 to-indigo-700", likes: 98, editions: "2/5", chain: "Polygon" },
  { id: 8, tokenId: 333, title: "Data Sculpture #333", creator: "0x3c9D...7e2F", price: "2.0", rarity: "Rare", gradient: "from-cyan-400 to-blue-600", likes: 67, editions: "4/15", chain: "Polygon" },
];

const RARITY_COLORS: Record<string, string> = {
  Common: "badge-blue",
  Rare: "badge-cyan",
  Epic: "badge-purple",
  Legendary: "badge-amber",
  Mythic: "badge-red",
};

export default function NFTPage() {
  const [selectedNFT, setSelectedNFT] = useState<typeof NFTS[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const rarities = ["all", "Common", "Rare", "Epic", "Legendary", "Mythic"];
  const filtered = filter === "all" ? NFTS : NFTS.filter((n) => n.rarity === filter);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <Blocks className="w-6 h-6 text-purple-400" />
          NFT Gallery
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Proof-of-Ownership NFTs — each token represents verified digital asset ownership
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total NFTs", value: "342", color: "text-purple-400" },
          { label: "Floor Price", value: "0.5 MATIC", color: "text-green-400" },
          { label: "Owners", value: "189", color: "text-blue-400" },
          { label: "Volume", value: "1.2K MATIC", color: "text-cyan-400" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rarity Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {rarities.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === r
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                : "text-[var(--text-muted)] hover:text-white bg-white/[0.02] border border-transparent"
            }`}
          >
            {r === "all" ? "All Rarities" : r}
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map((nft, i) => (
          <motion.div
            key={nft.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedNFT(nft)}
            className="glass-card overflow-hidden group cursor-pointer"
          >
            {/* NFT Visual */}
            <div className={`h-48 bg-gradient-to-br ${nft.gradient} relative flex items-center justify-center`}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              >
                <Sparkles className="w-16 h-16 text-white/20" />
              </motion.div>

              <div className="absolute top-3 left-3">
                <span className={`badge ${RARITY_COLORS[nft.rarity]} text-[10px] backdrop-blur-sm bg-black/30 border-white/10`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-xs font-mono text-white/60 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-md">
                  #{nft.tokenId}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="text-[10px] text-white/50 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-md">
                  {nft.editions}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-white truncate">{nft.title}</h3>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{nft.creator}</p>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-[10px] text-[var(--text-muted)]">Price</p>
                  <p className="text-base font-bold gradient-text-accent">{nft.price} MATIC</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Heart className="w-3 h-3" /> {nft.likes}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNFT && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNFT(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="glass-card max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-52 rounded-xl bg-gradient-to-br ${selectedNFT.gradient} flex items-center justify-center mb-6`}>
              <Sparkles className="w-20 h-20 text-white/20" />
            </div>

            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNFT.title}</h2>
                <p className="text-sm text-[var(--text-muted)] font-mono mt-1">{selectedNFT.creator}</p>
              </div>
              <span className={`badge ${RARITY_COLORS[selectedNFT.rarity]}`}>{selectedNFT.rarity}</span>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: "Token ID", value: `#${selectedNFT.tokenId}` },
                { label: "Chain", value: selectedNFT.chain },
                { label: "Editions", value: selectedNFT.editions },
                { label: "Price", value: `${selectedNFT.price} MATIC` },
                { label: "Likes", value: selectedNFT.likes.toString() },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm text-[var(--text-muted)]">{item.label}</span>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="btn-primary flex-1">
                <Shield className="w-4 h-4" />
                View Proof
              </button>
              <button className="btn-secondary flex-1">
                <ArrowLeftRight className="w-4 h-4" />
                Transfer
              </button>
            </div>

            <button
              onClick={() => setSelectedNFT(null)}
              className="btn-ghost w-full mt-3 text-[var(--text-muted)]"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
