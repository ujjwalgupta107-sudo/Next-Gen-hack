'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';
import { Shield, Mail, Lock, Wallet, ArrowRight, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithMetaMask, isLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'email' | 'metamask'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await loginWithEmail(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleMetaMaskSIWE = async () => {
    setError(null);
    setIsSubmitting(true);

    const res = await loginWithMetaMask();
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'MetaMask SIWE authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Subtle Ambient Light Glow */}
      <div className="light-ambient-glow w-[500px] h-[350px] bg-indigo-200/40 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 light-grid-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Proof<span className="text-indigo-600">Vault</span> AI
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sign In to Your Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Access your cryptographic IP proofs and on-chain certificates
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('metamask'); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                authMode === 'metamask'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              <span>MetaMask (SIWE)</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          {authMode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email or Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="creator@proofvault.ai or username"
                    className="input-field pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold no-underline transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn-primary w-full py-3 text-xs font-semibold shadow-md mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* MetaMask SIWE View */
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sign-In with Ethereum (SIWE)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Sign a secure cryptographic nonce with your MetaMask or Polygon wallet to verify ownership without passwords.
                </p>
              </div>

              <button
                type="button"
                onClick={handleMetaMaskSIWE}
                disabled={isSubmitting || isLoading}
                className="btn-primary w-full py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{isSubmitting ? 'Connecting Wallet...' : 'Sign In with MetaMask'}</span>
              </button>
            </div>
          )}

          {/* Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 no-underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
