import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Repeat, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';

// ─── Brand panel ──────────────────────────────────────────────────────────────
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full bg-[#1e4031] p-12 text-white">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center">
          <Repeat className="w-6 h-6" />
        </div>
        <span className="text-2xl font-black tracking-tight">ReLoop</span>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sage-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Community Verification</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
          Join the circular revolution in Davanagere.
        </h1>
        <p className="text-sage-200 text-sm leading-relaxed">
          Buy, sell, rent, and trade pre-owned electronics, textbooks, and gear with verified neighbors and students.
        </p>

        <div className="space-y-2 pt-2 text-xs text-sage-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-400" />
            <span>Zero platform fees for local members</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-400" />
            <span>Approximate pickup areas protect your privacy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage-400" />
            <span>Verified environmental CO₂ diversion tracking</span>
          </div>
        </div>
      </div>

      <p className="text-sage-300/80 text-xs">
        VTU Community Project • Topic 37: Waste Recycling & Circular Economy
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const isSignUp = searchParams.get('signup') === 'true';
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const toggleMode = (signUpMode: boolean) => {
    setAuthError('');
    if (signUpMode) {
      searchParams.set('signup', 'true');
    } else {
      searchParams.delete('signup');
    }
    setSearchParams(searchParams);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setAuthError('Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, fullName.trim());
        toast('Account created! Welcome to ReLoop.', 'success');
      } else {
        await signIn(email.trim(), password);
        toast('Welcome back to ReLoop!', 'success');
      }
      navigate(redirect, { replace: true });
    } catch (err) {
      setAuthError((err as Error).message ?? 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left brand panel */}
      <div className="lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0">
        <BrandPanel />
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center p-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-cream-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sage-500 text-white flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-charcoal-900">ReLoop</span>
            </Link>
            <span className="text-xs text-charcoal-400 font-semibold">Davanagere</span>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-charcoal-900 tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-sm text-charcoal-500">
              {isSignUp 
                ? 'Join your local community to buy, sell, rent, and trade.' 
                : 'Sign in to access your listings, rentals, and messages.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-cream-200/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isSignUp 
                  ? 'bg-white text-charcoal-900 shadow-xs' 
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isSignUp 
                  ? 'bg-white text-charcoal-900 shadow-xs' 
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Register New
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name for Registration */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-sm outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@college.edu or personal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-sm outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-charcoal-800">
                  Password <span className="text-rose-500">*</span>
                </label>
                {!isSignUp && (
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-sage-700 hover:text-sage-800 font-semibold"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-sm outline-none focus:ring-2 focus:ring-sage-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-bold text-white text-sm bg-sage-600 hover:bg-sage-700 active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSignUp ? 'Creating Account…' : 'Signing In…'}
                </>
              ) : (
                isSignUp ? 'Create Free Account' : 'Sign In to ReLoop'
              )}
            </button>

          </form>

          {/* Quick Demo Credentials Tip (Development Only) */}
          {import.meta.env.DEV && (
            <div className="p-3.5 bg-cream-100/90 border border-cream-200 rounded-xl text-xs text-charcoal-600 text-left space-y-1">
              <span className="font-bold text-charcoal-800">Demo Accounts (Dev Only):</span>
              <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('ananya.sharma@example.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 rounded-md bg-white border border-cream-300 font-mono text-sage-800 hover:bg-sage-50"
                >
                  Ananya (BIET)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('karthik.gowda@example.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 rounded-md bg-white border border-cream-300 font-mono text-sage-800 hover:bg-sage-50"
                >
                  Karthik (MCC)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@reloop.in');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 rounded-md bg-white border border-cream-300 font-mono text-amber-800 hover:bg-amber-50"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-charcoal-500 hover:text-sage-700 font-medium">
              ← Return to Landing Page
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
