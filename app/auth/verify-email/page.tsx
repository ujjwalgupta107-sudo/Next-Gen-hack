'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const triggerVerification = async (verifyToken: string) => {
    setStatus('verifying');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Verification link expired or invalid');
      } else {
        setStatus('success');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Network error');
    }
  };

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
      triggerVerification(queryToken);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-green-500/15 via-cyan-500/15 to-transparent blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              ProofVault <span className="text-cyan-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Email Verification</h1>
          <p className="text-sm text-slate-400 mt-1">Activate your cryptographic creator identity</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 text-center">
          {status === 'verifying' && (
            <div className="space-y-4 py-6">
              <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-300">Verifying your cryptographic token with MongoDB...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-950/60 border border-green-500/50 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Email Successfully Verified!</h2>
              <p className="text-xs text-slate-400">
                Your ProofVault AI account is now verified. You have full access to decentralized proof anchoring, perceptual similarity audits, and NFT minting.
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white">Verification Failed</h2>
              <p className="text-xs text-red-300">{errorMessage}</p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <form onSubmit={(e) => { e.preventDefault(); triggerVerification(token); }} className="space-y-4">
              <p className="text-xs text-slate-400">
                Enter your email verification token below if you did not arrive via direct confirmation link:
              </p>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Verification token"
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center gap-2"
              >
                Verify Email Token <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
