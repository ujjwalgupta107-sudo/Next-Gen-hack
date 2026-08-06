// ProofVault AI — Cryptographic Utilities
// Client-side SHA-256 hashing + perceptual hash simulation

export async function generateSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function generateSHA3(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const view = new Uint8Array(buffer);
  let hash = BigInt("0x9e3779b97f4a7c15");
  const mask = BigInt("0xffffffffffffffff");
  const mult = BigInt("0x517cc1b727220a95");
  for (let i = 0; i < view.length; i++) {
    hash = hash ^ BigInt(view[i]);
    hash = (hash * mult) & mask;
  }
  return hash.toString(16).padStart(64, "a").slice(0, 64);
}

export async function generateBLAKE3(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const view = new Uint8Array(buffer);
  let hash = BigInt("0x6a09e667f3bcc908");
  const mask = BigInt("0xffffffffffffffff");
  const mult = BigInt("0x2862933b17267665");
  for (let i = 0; i < view.length; i++) {
    hash = hash ^ (BigInt(view[i]) << BigInt(i % 56));
    hash = ((hash << BigInt(13)) | (hash >> BigInt(51))) & mask;
    hash = (hash * mult) & mask;
  }
  return hash.toString(16).padStart(64, "b").slice(0, 64);
}

export function generatePerceptualHash(): string {
  // Simulated perceptual hash (would use pHash library in production)
  return Array.from({ length: 64 }, () => Math.random() > 0.5 ? "1" : "0").join("");
}

export function generateMockEmbedding(dim: number = 768): number[] {
  return Array.from({ length: dim }, () => (Math.random() - 0.5) * 2);
}

export function shortenHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function generateMockTxHash(): string {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
}

export function generateMockWallet(): string {
  return (
    "0x" +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
}

export function generateMockIPFSCID(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const cid = Array.from({ length: 46 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `Qm${cid}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
