import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { DAVANAGERE_AREAS } from '../../lib/utils';

export const ProfileSettingsPage: React.FC = () => {
  const { user, profile, updateProfile, isSupabaseConnected } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || 'College student enthusiastic about circular economy & tech reuse.');
  const [area, setArea] = useState(profile?.area || DAVANAGERE_AREAS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        area,
      });
      toast('Profile information updated successfully!', 'success');
    } catch (err) {
      toast('Failed to update profile: ' + (err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="pb-6 border-b border-cream-200">
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Manage your personal identity, contact preferences, and neighborhood area.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
            <div className="w-16 h-16 rounded-2xl bg-sage-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {fullName ? fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-sm">{fullName || 'Community Member'}</h3>
              <p className="text-xs text-charcoal-500">{user?.email || 'member@reloop.in'}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-sage-800 bg-sage-100 font-bold px-2 py-0.5 rounded-md mt-1">
                <ShieldCheck className="w-3 h-3 text-sage-600" /> Davanagere Resident
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'member@reloop.in'}
              className="w-full bg-cream-200/50 border border-cream-300 rounded-xl px-3.5 py-2 text-sm text-charcoal-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-charcoal-400 mt-1 block">
              Email is managed by authentication provider and cannot be modified directly.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
              Primary Neighborhood Area in Davanagere
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3.5 py-2 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              {DAVANAGERE_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
              Community Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" loading={saving} icon={<CheckCircle2 className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default ProfileSettingsPage;
