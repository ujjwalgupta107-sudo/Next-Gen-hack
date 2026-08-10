"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
} from "lucide-react";
import { shortenAddress, shortenHash } from "../../lib/crypto";

const NFTS = [
  { id: 1, tokenId: 42, title: "Digital Cosmos #42", creator: "0x7a3B...4d2F", price: "2.5", rarity: "Legendary", gradient: "from-indigo-600 via-purple-600 to-cyan-500", likes: 124, editions: "1/1", chain: "Polygon Amoy" },
  { id: 2, tokenId: 187, title: "Neural Dreams #187", creator: "0x9c1E...8a3B", price: "1.2", rarity: "Epic", gradient: "from-pink-600 to-purple-700", likes: 87, editions: "3/10", chain: "Polygon Amoy" },
  { id: 3, tokenId: 256, title: "Code Genesis #256", creator: "0x5f4D...2c1A", price: "0.8", rarity: "Rare", gradient: "from-amber-500 to-red-600", likes: 56, editions: "5/25", chain: "Polygon Amoy" },
  { id: 4, tokenId: 512, title: "Sonic Wave #512", creator: "0x2b8A...6e9C", price: "3.0", rarity: "Legendary", gradient: "from-green-500 to-cyan-600", likes: 203, editions: "1/1", chain: "Polygon Amoy" },
  { id: 5, tokenId: 73, title: "Abstract Protocol #73", creator: "0x1d7F...3b5E", price: "0.5", rarity: "Common", gradient: "from-slate-500 to-indigo-600", likes: 34, editions: "10/50", chain: "Polygon Amoy" },
  { id: 6, tokenId: 891, title: "Quantum Art #891", creator: "0x8e2C...9f4A", price: "5.0", rarity: "Mythic", gradient: "from-yellow-400 via-red-500 to-purple-600", likes: 312, editions: "1/1", chain: "Polygon Amoy" },
  { id: 7, tokenId: 144, title: "Pixel Harmony #144", creator: "0x4a6B...1d8C", price: "1.5", rarity: "Epic", gradient: "from-blue-500 to-indigo-700", likes: 98, editions: "2/5", chain: "Polygon Amoy" },
  { id: 8, tokenId: 333, title: "Data Sculpture #333", creator: "0x3c9D...7e2F", price: "2.0", rarity: "Rare", gradient: "from-cyan-400 to-blue-600", likes: 67, editions: "4/15", chain: "Polygon Amoy" },
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Blocks className="w-4 h-4" />
            </div>
            <span>Proof-of-Ownership NFT Gallery</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Standardized ERC-721 tokens representing cryptographic digital asset ownership on Polygon.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Proof NFTs", value: "342" },
          { label: "Floor Price", value: "0.5 MATIC" },
          { label: "Verified Owners", value: "189" },
          { label: "Trading Volume", value: "1.2K MATIC" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rarity Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {rarities.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filter === r
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedNFT(nft)}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer group"
          >
            {/* Visual Art Header */}
            <div className={`h-44 bg-gradient-to-br ${nft.gradient} relative flex items-center justify-center`}>
              <Sparkles className="w-12 h-12 text-white/30 group-hover:scale-110 transition-transform" />
              <div className="absolute top-3 left-3">
                <span className={`badge ${RARITY_COLORS[nft.rarity]} text-[10px] bg-white/95 backdrop-blur-xs shadow-xs`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="text-[11px] font-mono font-bold text-slate-900 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                  #{nft.tokenId}
                </span>
              </div>
            </div>

            {/* Info Body */}
            <div className="p-4 space-y-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 truncate">{nft.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creator: <span className="font-mono text-slate-700 font-semibold">{nft.creator}</span>
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700">{nft.editions} edition</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{nft.price} MATIC</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedNFT && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedNFT(null)}
                className="btn-icon w-8 h-8 absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </button>

              <div className={`h-40 rounded-2xl bg-gradient-to-br ${selectedNFT.gradient} flex items-center justify-center relative shadow-xs`}>
                <Sparkles className="w-14 h-14 text-white/40" />
                <span className="absolute bottom-3 left-3 text-xs font-mono font-bold text-slate-900 bg-white/95 px-2.5 py-1 rounded-lg">
                  Token ID #{selectedNFT.tokenId}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900">{selectedNFT.title}</h3>
                  <span className={`badge ${RARITY_COLORS[selectedNFT.rarity]} text-[10px]`}>
                    {selectedNFT.rarity}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Cryptographically secured Proof-of-Ownership ERC-721 smart contract on {selectedNFT.chain}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Contract Type</p>
                  <p className="font-semibold text-slate-900 mt-0.5">ERC-721 ProofNFT</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Network</p>
                  <p className="font-semibold text-indigo-600 mt-0.5">Polygon Amoy</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Creator</p>
                  <p className="font-mono text-slate-700 font-semibold mt-0.5">{selectedNFT.creator}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Floor Value</p>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedNFT.price} MATIC</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Close
                </button>
                <a
                  href={`https://amoy.polygonscan.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary flex-1 text-xs py-2.5 no-underline shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>View on PolygonScan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
