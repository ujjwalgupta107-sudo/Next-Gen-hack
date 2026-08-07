'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { buildSIWEMessage } from './auth';

export type UserRole = 'creator' | 'enterprise' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  walletAddress?: string;
  profileImage?: string;
  bio?: string;
  role: UserRole;
  reputationScore: number;
  verified: boolean;
  createdAt?: string;
  lastLogin?: string;
  stats?: {
    assets: number;
    nfts: number;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletConnected: boolean;
  currentWallet: string | null;
  loginWithEmail: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (data: { username: string; fullName: string; email: string; password: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
  loginWithMetaMask: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string; bio?: string; profileImage?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  linkWallet: () => Promise<{ success: boolean; error?: string }>;
  unlinkWallet: () => Promise<{ success: boolean; error?: string }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);

  const refreshUserData = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user?.walletAddress) {
          setCurrentWallet(data.user.walletAddress);
          setWalletConnected(true);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setUser(data.user);
            if (data.user?.walletAddress) {
              setCurrentWallet(data.user.walletAddress);
              setWalletConnected(true);
            }
          }
        } else {
          if (mounted) setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    initAuth();

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentWallet(accounts[0].toLowerCase());
          setWalletConnected(true);
        } else {
          setCurrentWallet(null);
          setWalletConnected(false);
        }
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        mounted = false;
        (window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithEmail = async (loginIdentifier: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdentifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (params: { username: string; fullName: string; email: string; password: string; role?: UserRole }) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMetaMask = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return { success: false, error: 'MetaMask extension not found in browser. Please install MetaMask.' };
      }

      setIsLoading(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();

      // 1. Fetch challenge nonce from server
      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      const { nonce } = await nonceRes.json();

      // 2. Build standard EIP-4361 SIWE message
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const domain = window.location.host;
      const uri = window.location.origin;
      const issuedAt = new Date().toISOString();

      const message = buildSIWEMessage({
        address,
        domain,
        uri,
        nonce,
        issuedAt,
        chainId,
      });

      // 3. Request user cryptographic signature in MetaMask
      const signature = await signer.signMessage(message);

      // 4. Verify signature on backend & create session
      const authRes = await fetch('/api/auth/siwe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, walletAddress: address }),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        return { success: false, error: authData.error || 'SIWE verification failed' };
      }

      setUser(authData.user);
      setCurrentWallet(address);
      setWalletConnected(true);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'MetaMask connection rejected' };
    } finally {
      setIsLoading(false);
    }
  };

  const linkWallet = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return { success: false, error: 'MetaMask extension not found' };
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();

      const nonceRes = await fetch(`/api/auth/nonce?address=${address}`);
      const { nonce } = await nonceRes.json();

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const domain = window.location.host;
      const uri = window.location.origin;
      const issuedAt = new Date().toISOString();

      const message = buildSIWEMessage({
        address,
        domain,
        uri,
        nonce,
        issuedAt,
        chainId,
        statement: 'Link this Ethereum wallet to your ProofVault AI account.',
      });

      const signature = await signer.signMessage(message);

      const res = await fetch('/api/auth/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, walletAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to link wallet' };
      }

      await refreshUserData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Wallet linking failed' };
    }
  };

  const unlinkWallet = async () => {
    try {
      const res = await fetch('/api/auth/unlink-wallet', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to unlink wallet' };
      }
      await refreshUserData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateProfile = async (params: {
    fullName?: string;
    bio?: string;
    profileImage?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      setWalletConnected(false);
      setCurrentWallet(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        walletConnected,
        currentWallet,
        loginWithEmail,
        signupWithEmail,
        loginWithMetaMask,
        logout,
        updateProfile,
        linkWallet,
        unlinkWallet,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
