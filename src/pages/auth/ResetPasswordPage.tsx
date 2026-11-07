import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repeat, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await updatePassword(password);
      toast('Your password has been successfully updated!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Failed to update password.');
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

        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Create new password
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Enter a strong new password for your ReLoop account.
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
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            Update Password & Sign In
          </Button>
        </form>

      </div>
    </div>
  );
};

export default ResetPasswordPage;
