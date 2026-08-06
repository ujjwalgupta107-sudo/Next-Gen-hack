// ProofVault AI — Global State Store (simulated blockchain + asset management)
"use client";

export interface Asset {
  id: string;
  title: string;
  description: string;
  contentType: string;
  fileMetadata: {
    name: string;
    mimeType: string;
    size: number;
  };
  fingerprints: {
    sha256: string;
    sha3: string;
    blake3: string;
    phash: string;
    dhash: string;
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    timestamp: number;
    chain: string;
    gasUsed: string;
  };
  ipfsCID: string;
  nftTokenId: number | null;
  status: "registered" | "pending" | "disputed";
  verificationCount: number;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface VerificationResult {
  id: string;
  uploadedHash: string;
  result: "exact_match" | "near_match" | "no_match";
  matchedAsset?: Asset;
  similarity?: number;
  timestamp: string;
}

const STORAGE_KEY = "proofvault_assets";
const VERIFICATIONS_KEY = "proofvault_verifications";
const WALLET_KEY = "proofvault_wallet";

export function getStoredAssets(): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function storeAsset(asset: Asset): void {
  const assets = getStoredAssets();
  assets.unshift(asset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function getStoredVerifications(): VerificationResult[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(VERIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function storeVerification(result: VerificationResult): void {
  const results = getStoredVerifications();
  results.unshift(result);
  localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(results));
}

export function findAssetByHash(sha256: string): Asset | undefined {
  return getStoredAssets().find((a) => a.fingerprints.sha256 === sha256);
}

export function getConnectedWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WALLET_KEY);
}

export function setConnectedWallet(address: string | null): void {
  if (address) {
    localStorage.setItem(WALLET_KEY, address);
  } else {
    localStorage.removeItem(WALLET_KEY);
  }
}

// Simulated content type detection
export function detectContentType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType === "application/pdf") return "Document";
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("python") ||
    mimeType.includes("text/plain") ||
    mimeType.includes("text/x-")
  )
    return "Source Code";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("sketch") ||
    mimeType.includes("figma")
  )
    return "Design File";
  return "Document";
}

// Mock data for demo
export const MOCK_STATS = {
  totalRegistrations: 147_832,
  totalVerifications: 892_451,
  totalCreators: 23_891,
  assetsProtected: 1_247_000,
  gasFeeSaved: "99.9%",
  avgProcessingTime: "2.3s",
};

export const CONTENT_TYPES = [
  { value: "image", label: "Images", icon: "🖼️", count: 45_230 },
  { value: "video", label: "Videos", icon: "🎬", count: 12_890 },
  { value: "audio", label: "Music", icon: "🎵", count: 8_450 },
  { value: "code", label: "Source Code", icon: "💻", count: 34_120 },
  { value: "document", label: "Documents", icon: "📄", count: 28_900 },
  { value: "research", label: "Research", icon: "🔬", count: 6_780 },
  { value: "design", label: "Designs", icon: "🎨", count: 9_120 },
  { value: "ai", label: "AI Content", icon: "🤖", count: 2_342 },
];

export function generateMockAssets(): Asset[] {
  const types = ["Image", "Video", "Audio", "Source Code", "Document", "Design File"];
  const titles = [
    "Sunset Photography Collection",
    "Neural Network Architecture Diagram",
    "Electronic Music Track - Neon Dreams",
    "React Component Library v2.0",
    "Research Paper - AI Ethics Framework",
    "Brand Identity Design System",
    "3D Landscape Render - Mountain Valley",
    "Smart Contract Security Audit Report",
    "Ambient Soundscape - Deep Ocean",
    "Mobile App UI Kit - FinTech",
    "Machine Learning Dataset - Medical Imaging",
    "Typography Exploration - Geometric Sans",
  ];
  
  return titles.map((title, i) => ({
    id: `asset-${i + 1}`,
    title,
    description: `A registered digital asset on ProofVault AI blockchain.`,
    contentType: types[i % types.length],
    fileMetadata: {
      name: title.toLowerCase().replace(/\s+/g, "-") + ".file",
      mimeType: "application/octet-stream",
      size: Math.floor(Math.random() * 50_000_000) + 100_000,
    },
    fingerprints: {
      sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      sha3: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      blake3: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      phash: Array.from({ length: 64 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""),
      dhash: Array.from({ length: 64 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""),
    },
    blockchain: {
      txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      blockNumber: 45_000_000 + Math.floor(Math.random() * 1_000_000),
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
      chain: "Polygon",
      gasUsed: (Math.random() * 0.01).toFixed(6),
    },
    ipfsCID: "Qm" + Array.from({ length: 44 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))).join(""),
    nftTokenId: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : null,
    status: "registered",
    verificationCount: Math.floor(Math.random() * 50),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
  }));
}
