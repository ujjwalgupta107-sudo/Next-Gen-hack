// ProofVault AI — Production-Grade Cryptography Engine
// Real SHA-256 (Web Crypto API), Real SHA3-256 (@noble/hashes/sha3),
// Real BLAKE3 (@noble/hashes/blake3), and True 2D-DCT Perceptual Hashing (pHash).

import { sha3_256 } from "@noble/hashes/sha3";
import { blake3 } from "@noble/hashes/blake3";
import { bytesToHex } from "@noble/hashes/utils";

/**
 * Generates cryptographic SHA-256 hash using the native browser Web Crypto API.
 */
export async function generateSHA256(input: File | Blob | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (input instanceof ArrayBuffer) {
    buffer = input;
  } else {
    buffer = await input.arrayBuffer();
  }
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates cryptographic SHA3-256 (FIPS 202) hash using the official @noble/hashes implementation.
 */
export async function generateSHA3(input: File | Blob | ArrayBuffer): Promise<string> {
  let bytes: Uint8Array;
  if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    const buffer = await input.arrayBuffer();
    bytes = new Uint8Array(buffer);
  }
  const digest = sha3_256(bytes);
  return bytesToHex(digest);
}

/**
 * Generates cryptographic BLAKE3 hash using the official @noble/hashes implementation.
 */
export async function generateBLAKE3(input: File | Blob | ArrayBuffer): Promise<string> {
  let bytes: Uint8Array;
  if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    const buffer = await input.arrayBuffer();
    bytes = new Uint8Array(buffer);
  }
  const digest = blake3(bytes);
  return bytesToHex(digest);
}

/**
 * Computes 1D DCT on an array of length N.
 */
function computeDCT1D(input: number[]): number[] {
  const N = input.length;
  const output = new Array<number>(N);
  for (let k = 0; k < N; k++) {
    let sum = 0;
    for (let n = 0; n < N; n++) {
      sum += input[n] * Math.cos(((2 * n + 1) * k * Math.PI) / (2 * N));
    }
    const factor = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
    output[k] = sum * factor;
  }
  return output;
}

/**
 * Computes 2D DCT on a 32x32 matrix.
 */
function computeDCT2D(matrix: number[][]): number[][] {
  const N = 32;
  // Apply DCT to each row
  const rowTransformed: number[][] = [];
  for (let y = 0; y < N; y++) {
    rowTransformed.push(computeDCT1D(matrix[y]));
  }
  // Apply DCT to each column
  const result: number[][] = Array.from({ length: N }, () => new Array<number>(N));
  for (let x = 0; x < N; x++) {
    const colInput = new Array<number>(N);
    for (let y = 0; y < N; y++) {
      colInput[y] = rowTransformed[y][x];
    }
    const colTransformed = computeDCT1D(colInput);
    for (let y = 0; y < N; y++) {
      result[y][x] = colTransformed[y];
    }
  }
  return result;
}

/**
 * Computes the median of an array of numbers.
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Generates a true 64-bit 2D-DCT Perceptual Hash (pHash) for images.
 * Decodes the image bitmap, resizes to 32x32, converts to grayscale, applies 2D DCT,
 * extracts the top-left 8x8 low-frequency coefficients (excluding DC [0,0]),
 * and computes a 64-bit hash based on the median value.
 */
export async function generatePerceptualHash(input?: File | Blob | ArrayBuffer): Promise<string> {
  if (!input) {
    return "0000000000000000";
  }

  // Check if browser environment with Canvas support
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      let blob: Blob;
      if (input instanceof Blob) {
        blob = input;
      } else {
        blob = new Blob([input]);
      }

      // Only attempt Canvas bitmap decoding if image mime or valid image blob
      if (blob.type.startsWith("image/") || blob.size > 0) {
        const imageBitmap = await createImageBitmap(blob).catch(() => null);
        if (imageBitmap) {
          const canvas = document.createElement("canvas");
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(imageBitmap, 0, 0, 32, 32);
            const imgData = ctx.getImageData(0, 0, 32, 32);
            const data = imgData.data;

            // Construct 32x32 grayscale luminance matrix
            const matrix: number[][] = [];
            for (let y = 0; y < 32; y++) {
              const row: number[] = [];
              for (let x = 0; x < 32; x++) {
                const idx = (y * 32 + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // ITU-R BT.601 luminance
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                row.push(lum);
              }
              matrix.push(row);
            }

            // Compute 2D DCT
            const dct = computeDCT2D(matrix);

            // Extract 8x8 top-left low frequencies (64 coefficients)
            const lowFreq: number[] = [];
            for (let u = 0; u < 8; u++) {
              for (let v = 0; v < 8; v++) {
                // Skip DC term at (0,0) for median calculation
                if (u !== 0 || v !== 0) {
                  lowFreq.push(dct[u][v]);
                }
              }
            }

            const median = calculateMedian(lowFreq);

            // Generate 64-bit binary string
            let bitString = "";
            for (let u = 0; u < 8; u++) {
              for (let v = 0; v < 8; v++) {
                bitString += dct[u][v] >= median ? "1" : "0";
              }
            }

            // Convert 64-bit binary to 16 hex characters
            let hex = "";
            for (let i = 0; i < 64; i += 4) {
              const nibble = parseInt(bitString.substring(i, i + 4), 2);
              hex += nibble.toString(16);
            }
            return hex;
          }
        }
      }
    } catch {
      // Fallback to cryptographic buffer-derived deterministic hash
    }
  }

  // Non-image / fallback deterministic perceptual representation
  const sha = await generateSHA256(input);
  return sha.slice(0, 16);
}

export function shortenHash(hash: string, chars: number = 8): string {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function shortenAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string | number): string {
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
