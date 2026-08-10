'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="light-ambient-glow w-[500px] h-[350px] bg-green-200/30 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 light-grid-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
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
            Email Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Activate your cryptographic creator identity
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center">
          {status === 'verifying' && (
            <div className="space-y-4 py-6">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600">Verifying your cryptographic token with MongoDB...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Email Successfully Verified!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your ProofVault AI account is verified. You have full access to decentralized proof anchoring, perceptual similarity audits, and NFT minting.
              </p>
              <div className="pt-3">
                <Link
                  href="/dashboard"
                  className="btn-primary w-full py-3 text-xs font-semibold no-underline shadow-md flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Verification Failed
              </h2>
              <p className="text-xs text-red-700">{errorMessage}</p>
              <div className="pt-3">
                <Link
                  href="/auth/login"
                  className="btn-secondary w-full py-2.5 text-xs no-underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="py-6 text-xs text-slate-500">
              Awaiting verification token...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
