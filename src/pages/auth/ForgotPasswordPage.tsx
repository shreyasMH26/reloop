import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-modal max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2 pb-4 border-b border-cream-200">
          <div className="w-8 h-8 rounded-xl bg-sage-500 text-white flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-charcoal-900">ReLoop</span>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-charcoal-900">
              Reset Link Dispatched
            </h2>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              If an account is associated with <span className="font-bold text-charcoal-800">{email}</span>, you will receive password recovery instructions shortly.
            </p>
            <div className="pt-2">
              <Link to="/auth/login">
                <Button variant="primary" fullWidth size="md">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
                Reset your password
              </h1>
              <p className="text-xs text-charcoal-500 mt-1">
                Enter your registered email address and we'll send you a secure link to reset your credentials.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                loading={loading}
              >
                Send Password Reset Link
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-charcoal-500 hover:text-sage-700 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
