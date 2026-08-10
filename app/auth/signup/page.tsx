'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/app/lib/auth-context';
import { Shield, Mail, Lock, User, Wallet, ArrowRight, AlertCircle, Sparkles, Building, Palette } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Subtle Ambient Light Glow */}
      <div className="light-ambient-glow w-[550px] h-[400px] bg-indigo-200/40 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute inset-0 light-grid-pattern opacity-40 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
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
            Create Your Creator Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Anchor, verify, and license your digital IP cryptographically on Polygon
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {/* Quick MetaMask button */}
          <button
            type="button"
            onClick={handleMetaMaskSignup}
            disabled={isSubmitting || isLoading}
            className="w-full mb-5 py-3 px-4 rounded-xl font-semibold text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 hover:text-indigo-900 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Wallet className="w-4 h-4 text-indigo-600" />
            <span>Fast Sign-In with MetaMask (SIWE)</span>
          </button>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or sign up with email
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                    role === 'creator'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Palette className={`w-4 h-4 ${role === 'creator' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Individual Creator</div>
                    <div className="text-[10px] text-slate-500">Artists, Devs, Writers</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('enterprise')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                    role === 'enterprise'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Building className={`w-4 h-4 ${role === 'enterprise' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-xs font-bold">Studio / Agency</div>
                    <div className="text-[10px] text-slate-500">Teams & Catalogs</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="janedoe"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-field pl-10 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-600 hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary w-full py-3 text-xs font-semibold shadow-md mt-2"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700 no-underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
