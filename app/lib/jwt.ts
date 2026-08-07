import jwt, { SignOptions } from 'jsonwebtoken';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'proofvault_production_jwt_super_secret_signing_key_32_chars_min';
const JWT_EXPIRES_IN = '1h'; // Access token validity
const REFRESH_TOKEN_EXPIRES_DAYS = 30; // Refresh token validity

export interface JWTPayload {
  userId: string;
  username: string;
  email?: string;
  walletAddress?: string;
  role: UserRole;
  verified: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Signs a cryptographic JWT access token with user payload.
 */
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT access token. Returns null if expired or invalid.
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Generates a cryptographically strong 64-character hex refresh token.
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes SHA-256 hash of a token for secure database storage.
 */
export async function hashToken(rawToken: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(rawToken);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const AUTH_COOKIE_NAME = 'pv_access_token';
export const REFRESH_COOKIE_NAME = 'pv_refresh_token';

/**
 * Production-ready secure cookie options.
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
