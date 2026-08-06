// ProofVault AI — Real State Manager (MongoDB + IPFS + Polygon)
"use client";

import { ethers } from "ethers";

export interface Asset {
  _id?: string;
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
  nftTokenId?: number;
  status: "registered" | "pending" | "disputed";
  verificationCount: number;
  ownerAddress: string;
  createdAt: string;
}

export interface VerificationResult {
  _id?: string;
  uploadedHash: string;
  result: "exact_match" | "near_match" | "no_match";
  matchedAssetId?: string;
  similarityScore?: number;
  timestamp: string;
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
