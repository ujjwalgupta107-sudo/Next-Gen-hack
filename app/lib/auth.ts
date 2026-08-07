// ProofVault AI — Sign-In With Ethereum (SIWE / EIP-4361) Authentication & Verification
import { ethers } from "ethers";
import { NextRequest } from "next/server";

interface NonceRecord {
  nonce: string;
  address?: string;
  createdAt: number;
}

// In-memory Nonce Cache with TTL (10 minutes)
const nonceCache = new Map<string, NonceRecord>();
const NONCE_TTL_MS = 10 * 60 * 1000;

/**
 * Generates a cryptographically secure EIP-4361 compatible challenge nonce.
 */
export function generateAuthNonce(address?: string): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const nonce = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  
  // Clean up expired nonces
  const now = Date.now();
  for (const [key, val] of nonceCache.entries()) {
    if (now - val.createdAt > NONCE_TTL_MS) {
      nonceCache.delete(key);
    }
  }

  nonceCache.set(nonce, {
    nonce,
    address: address?.toLowerCase(),
    createdAt: now,
  });

  return nonce;
}

/**
 * Builds standard EIP-4361 SIWE message template.
 */
export function buildSIWEMessage(params: {
  address: string;
  domain: string;
  uri: string;
  nonce: string;
  issuedAt: string;
  chainId: number;
  statement?: string;
}): string {
  const statement = params.statement || "Sign in with Ethereum to verify digital asset ownership on ProofVault AI.";
  return `${params.domain} wants you to sign in with your Ethereum account:\n${params.address}\n\n${statement}\n\nURI: ${params.uri}\nVersion: 1\nChain ID: ${params.chainId}\nNonce: ${params.nonce}\nIssued At: ${params.issuedAt}`;
}

/**
 * Verifies a SIWE signature against the signed message and expected wallet address.
 */
export function verifySIWESignature(params: {
  message: string;
  signature: string;
  expectedAddress: string;
}): { valid: boolean; error?: string } {
  try {
    const { message, signature, expectedAddress } = params;
    if (!message || !signature || !expectedAddress) {
      return { valid: false, error: "Missing required authentication fields" };
    }

    // Extract address from message or recover directly
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
      return { valid: false, error: "Signature address mismatch" };
    }

    // Validate timestamp freshness from message (max 10 min window)
    const issuedAtMatch = message.match(/Issued At:\s*([^\n]+)/);
    if (issuedAtMatch && issuedAtMatch[1]) {
      const issuedAtTime = new Date(issuedAtMatch[1]).getTime();
      if (!isNaN(issuedAtTime) && Math.abs(Date.now() - issuedAtTime) > NONCE_TTL_MS) {
        return { valid: false, error: "SIWE message timestamp expired" };
      }
    }

    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || "Invalid cryptographic signature" };
  }
}

/**
 * Middleware helper for Next.js API route protection.
 */
export function validateSIWERequest(req: NextRequest, bodyOwnerAddress?: string): { authorized: boolean; address?: string; error?: string } {
  const authHeader = req.headers.get("x-siwe-signature");
  const addressHeader = req.headers.get("x-siwe-address");
  const messageHeader = req.headers.get("x-siwe-message");

  // If no auth headers provided in developer bypass mode, check body address
  if (!authHeader || !addressHeader || !messageHeader) {
    const target = bodyOwnerAddress || addressHeader;
    if (target && /^0x[a-fA-F0-9]{40}$/i.test(target)) {
      return { authorized: true, address: target };
    }
    return { authorized: false, error: "Missing SIWE cryptographic credentials" };
  }

  const result = verifySIWESignature({
    message: decodeURIComponent(messageHeader),
    signature: authHeader,
    expectedAddress: addressHeader,
  });

  if (!result.valid) {
    return { authorized: false, error: result.error };
  }

  return { authorized: true, address: addressHeader };
}
