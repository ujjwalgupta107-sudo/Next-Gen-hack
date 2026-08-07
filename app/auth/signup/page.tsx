'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/app/lib/auth-context';
import { ShieldCheck, Mail, Lock, User, Wallet, ArrowRight, AlertCircle, Sparkles, Building, Palette } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signupWithEmail, loginWithMetaMask, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('creator');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsSubmitting(true);
    const res = await signupWithEmail({
      username,
      fullName,
      email,
      password,
      role,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  const handleMetaMaskSignup = async () => {
    setError(null);
    setIsSubmitting(true);
    const res = await loginWithMetaMask();
    setIsSubmitting(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'MetaMask connection failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Branding */}
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Your Account</h1>
          <p className="text-sm text-slate-400 mt-1">Anchor, verify, and license your digital assets cryptographically</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          {/* Quick MetaMask option */}
          <button
            type="button"
            onClick={handleMetaMaskSignup}
            disabled={isSubmitting || isLoading}
            className="w-full mb-6 py-3 px-4 rounded-xl font-semibold text-xs bg-slate-950 border border-slate-800 hover:border-purple-500 text-purple-300 hover:text-white flex items-center justify-center gap-2 transition-all shadow-md group"
          >
            <Wallet className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Fast Sign-In with MetaMask (SIWE)</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Or sign up with email
            </span>
            <div className="border-t border-slate-800 w-full" />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    role === 'creator'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Palette className={`w-5 h-5 ${role === 'creator' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-semibold">Creator</div>
                    <div className="text-[10px] text-slate-400">Artists, Devs, Writers</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('enterprise')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    role === 'enterprise'
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-500/10'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building className={`w-5 h-5 ${role === 'enterprise' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-semibold">Enterprise</div>
                    <div className="text-[10px] text-slate-400">Teams & Studios</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="creator_99"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Satoshi Nakamoto"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creator@proofvault.ai"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded bg-slate-950 border-slate-800 text-cyan-500 focus:ring-cyan-500 h-4 w-4"
              />
              <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
                I agree to ProofVault AI&apos;s Terms of Service & Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
