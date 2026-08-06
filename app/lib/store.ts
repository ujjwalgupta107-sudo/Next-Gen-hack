// ProofVault AI — Real State Manager (MongoDB + IPFS + Polygon)
"use client";

import { ethers } from "ethers";

export interface Asset {
  _id?: string;
  id?: string;
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
    phash?: string;
    dhash?: string;
    aiHash?: string;
  };
  blockchain: {
    txHash: string;
    blockNumber: number;
    timestamp: number;
    chain: string;
    gasUsed: string;
  };
  ipfsCID: string;
  thumbnailCID?: string;
  thumbnailUrl?: string;
  nftTokenId?: number | null;
  status: "registered" | "pending" | "disputed";
  verificationCount: number;
  ownerAddress: string;
  createdAt: string;
}

export interface VerificationResult {
  _id?: string;
  id?: string;
  uploadedHash: string;
  result: "exact_match" | "near_match" | "no_match";
  matchedAssetId?: string;
  matchedAsset?: Asset;
  similarity?: number;
  similarityScore?: number;
  timestamp: string;
}

export const MOCK_STATS = {
  totalAssets: 12840,
  verifiedProofs: 9420,
  activeDisputes: 14,
  protectedValue: "$4.2M",
  assetsProtected: 12840,
  totalVerifications: 9420,
  totalCreators: 3450,
};

export const CONTENT_TYPES = [
  { id: "image", label: "Images & Artwork", icon: "ImageIcon", count: 4820 },
  { id: "code", label: "Source Code & Scripts", icon: "CodeIcon", count: 3210 },
  { id: "document", label: "Documents & Patents", icon: "FileTextIcon", count: 2940 },
  { id: "audio", label: "Audio & Music", icon: "MusicIcon", count: 1870 },
];

export function detectContentType(filename: string, mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.includes("text")) return "document";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["js", "ts", "jsx", "tsx", "py", "sol", "cpp", "c", "java", "go", "rs", "html", "css", "json"].includes(ext || "")) return "code";
  return "document";
}

// -----------------------------------------------------
// API Clients for MongoDB
// -----------------------------------------------------

export async function fetchAssets(ownerAddress?: string): Promise<Asset[]> {
  if (typeof window === "undefined") return [];
  try {
    const url = ownerAddress ? `/api/assets?owner=${ownerAddress}` : '/api/assets';
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch assets");
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchAssetByHash(sha256: string): Promise<Asset | null> {
  try {
    const res = await fetch(`/api/assets/${sha256}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch asset");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createPendingAsset(assetData: Partial<Asset>): Promise<Asset | null> {
  try {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData)
    });
    if (!res.ok) throw new Error("Failed to create pending asset");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateAssetStatus(sha256: string, updateData: Partial<Asset>): Promise<Asset | null> {
  try {
    const res = await fetch(`/api/assets/${sha256}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error("Failed to update asset");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// -----------------------------------------------------
// Ethers.js Wallet Connection
// -----------------------------------------------------

export async function connectWallet(): Promise<string | null> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      return accounts[0] || null;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      return null;
    }
  }
  return null;
}

export async function getConnectedWallet(): Promise<string | null> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.listAccounts();
      return accounts.length > 0 ? accounts[0].address : null;
    } catch (err) {
      return null;
    }
  }
  return null;
}

export async function getStoredAssets(): Promise<Asset[]> {
  return await fetchAssets();
}

export function generateMockAssets(): Asset[] {
  return [];
}

export async function storeAsset(assetData: Partial<Asset>): Promise<Asset | null> {
  return await createPendingAsset(assetData);
}

export async function findAssetByHash(sha256: string): Promise<Asset | null> {
  return await fetchAssetByHash(sha256);
}

export async function storeVerification(verification: Partial<VerificationResult>): Promise<void> {
  // Saved via backend
}

export function setConnectedWallet(wallet: string | null): void {
  // Wallet state set in React component
}
