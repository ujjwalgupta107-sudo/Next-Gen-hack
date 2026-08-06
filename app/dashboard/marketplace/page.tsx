"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Tag,
  Heart,
  Eye,
  Blocks,
  Shield,
  Image,
  Film,
  Music,
  Code,
  FileText,
  Palette,
  Brain,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

const CONTENT_ICONS: Record<string, typeof Image> = {
  Image, Video: Film, Audio: Music, "Source Code": Code,
  Document: FileText, "Design File": Palette, "AI Generated": Brain,
};

const LISTINGS = [
  { id: "1", title: "Abstract Neon Cityscape", type: "Image", price: "0.5", currency: "MATIC", creator: "0x7a3B...4d2F", likes: 42, views: 189, gradient: "from-blue-600 to-purple-600", badge: "Featured" },
  { id: "2", title: "Lo-Fi Hip Hop Beat Pack", type: "Audio", price: "1.2", currency: "MATIC", creator: "0x9c1E...8a3B", likes: 31, views: 156, gradient: "from-green-500 to-cyan-500", badge: null },
  { id: "3", title: "React Component Library", type: "Source Code", price: "2.0", currency: "MATIC", creator: "0x5f4D...2c1A", likes: 87, views: 423, gradient: "from-amber-500 to-orange-500", badge: "Hot" },
  { id: "4", title: "Cinematic Drone Footage", type: "Video", price: "3.5", currency: "MATIC", creator: "0x2b8A...6e9C", likes: 56, views: 298, gradient: "from-purple-600 to-pink-600", badge: null },
  { id: "5", title: "AI Research Paper - Vision Transformers", type: "Document", price: "0.3", currency: "MATIC", creator: "0x1d7F...3b5E", likes: 23, views: 112, gradient: "from-gray-500 to-gray-600", badge: null },
  { id: "6", title: "Geometric Brand Identity", type: "Design File", price: "1.8", currency: "MATIC", creator: "0x8e2C...9f4A", likes: 64, views: 301, gradient: "from-pink-500 to-purple-500", badge: "Trending" },
  { id: "7", title: "Synthwave Music Album", type: "Audio", price: "2.5", currency: "MATIC", creator: "0x4a6B...1d8C", likes: 78, views: 445, gradient: "from-cyan-500 to-blue-500", badge: null },
  { id: "8", title: "AI Generated Landscape Collection", type: "AI Generated", price: "0.8", currency: "MATIC", creator: "0x3c9D...7e2F", likes: 35, views: 178, gradient: "from-blue-500 to-cyan-400", badge: "New" },
  { id: "9", title: "Machine Learning Pipeline", type: "Source Code", price: "4.0", currency: "MATIC", creator: "0x6f1A...4c8B", likes: 92, views: 567, gradient: "from-amber-400 to-red-500", badge: null },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("trending");
  const [filterType, setFilterType] = useState("all");

  const types = ["all", "Image", "Audio", "Source Code", "Video", "Document", "Design File", "AI Generated"];

  const filtered = LISTINGS.filter((l) => {
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "all" || l.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            Marketplace
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Discover, license, and trade verified digital assets</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Listings", value: "2,847", icon: Tag, color: "text-blue-400" },
          { label: "Volume (24h)", value: "1.2K MATIC", icon: TrendingUp, color: "text-green-400" },
          { label: "Active Traders", value: "891", icon: ShoppingBag, color: "text-purple-400" },
          { label: "Avg. Price", value: "1.8 MATIC", icon: Blocks, color: "text-cyan-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color} shrink-0`} />
            <div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            className="glass-input pl-10"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterType === type
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/25"
                  : "text-[var(--text-muted)] hover:text-white bg-white/[0.02] border border-transparent"
              }`}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item, i) => {
          const IconComp = CONTENT_ICONS[item.type] || FileText;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden group cursor-pointer"
            >
              {/* Preview */}
              <div className={`h-44 bg-gradient-to-br ${item.gradient} relative flex items-center justify-center`}>
                <IconComp className="w-14 h-14 text-white/30 group-hover:scale-110 transition-transform duration-500" />
                {item.badge && (
                  <div className="absolute top-3 left-3">
                    <span className={`badge text-[10px] backdrop-blur-sm bg-black/40 border-white/10 ${
                      item.badge === "Featured" ? "badge-blue" :
                      item.badge === "Hot" ? "badge-red" :
                      item.badge === "Trending" ? "badge-amber" : "badge-green"
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="w-8 h-8 rounded-lg backdrop-blur-sm bg-black/30 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="badge badge-blue text-[10px] backdrop-blur-sm bg-black/30 border-white/10">
                    {item.type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-white truncate mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4 font-mono">{item.creator}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Price</p>
                    <p className="text-lg font-bold gradient-text">{item.price} <span className="text-xs text-[var(--text-muted)]">{item.currency}</span></p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{item.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                  </div>
                </div>

                <button className="btn-primary w-full mt-4 text-sm py-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  Purchase License
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
