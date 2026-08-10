'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to request reset link');
      } else {
        setSubmitted(true);
        if (data.resetToken) {
          setDevToken(data.resetToken);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <div className="light-ambient-glow w-[500px] h-[350px] bg-indigo-200/40 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Enter your registered email address to receive password reset instructions
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Reset Link Dispatched</h2>
              <p className="text-xs text-slate-600">
                If an account with <span className="text-indigo-600 font-semibold">{email}</span> exists, secure instructions have been sent.
              </p>

              {devToken && (
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-left text-xs space-y-2 mt-4">
                  <div className="text-indigo-700 font-bold flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4" />
                    Local Test Environment Detected
                  </div>
                  <div className="text-slate-800 break-all font-mono text-[11px] bg-white p-2 rounded border border-slate-200">
                    Token: {devToken}
                  </div>
                  <Link
                    href={`/auth/reset-password?token=${devToken}`}
                    className="inline-block w-full text-center py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs no-underline transition"
                  >
                    Click to Reset Password Directly →
                  </Link>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 no-underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@proofvault.ai"
                    className="input-field pl-10 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3 text-xs font-semibold shadow-md"
              >
                <span>{isSubmitting ? 'Sending Request...' : 'Send Reset Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 no-underline"
                >
                  Remember your password? Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
