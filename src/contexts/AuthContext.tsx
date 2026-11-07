import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Profile, UserRole } from '../types';
import { api, getStoredToken } from '../services/api';
import { isSupabaseConfigured } from '../lib/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, area?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string, token?: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider Component ───────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Session Restoration
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const res = await api.auth.getMe();
        if (mounted && res?.user) {
          setUser({
            id: res.user.id,
            email: res.user.email,
            role: res.user.role as UserRole,
          });
          setProfile({
            id: res.user.id,
            full_name: res.user.full_name || res.user.email.split('@')[0],
            avatar_url: res.user.avatar_url,
            phone: res.user.phone,
            area: res.user.area || 'MCC B Block',
            bio: res.user.bio,
            role: (res.user.role as UserRole) || 'user',
            rating: Number(res.user.rating) || 5.0,
            total_listings: res.user.total_listings || 0,
            created_at: res.user.created_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn('[ReLoop Auth] Session restore expired or invalid, clearing token.');
        api.auth.logout();
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Sign In
  const signIn = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res?.user) {
      setUser({
        id: res.user.id,
        email: res.user.email,
        role: res.user.role as UserRole,
      });
      setProfile({
        id: res.user.id,
        full_name: res.user.full_name || res.user.email.split('@')[0],
        avatar_url: res.user.avatar_url,
        phone: res.user.phone,
        area: res.user.area || 'MCC B Block',
        bio: res.user.bio,
        role: (res.user.role as UserRole) || 'user',
        rating: Number(res.user.rating) || 5.0,
        total_listings: res.user.total_listings || 0,
        created_at: res.user.created_at || new Date().toISOString(),
      });
    }
  };

  // 3. Sign Up
  const signUp = async (email: string, password: string, fullName: string, area?: string) => {
    const res = await api.auth.register({
      email,
      password,
      full_name: fullName,
      area: area || 'MCC B Block',
    });

    if (res?.user) {
      setUser({
        id: res.user.id,
        email: res.user.email,
        role: res.user.role as UserRole,
      });
      setProfile({
        id: res.user.id,
        full_name: res.user.full_name || fullName,
        avatar_url: res.user.avatar_url,
        phone: res.user.phone,
        area: res.user.area || area || 'MCC B Block',
        bio: res.user.bio,
        role: (res.user.role as UserRole) || 'user',
        rating: 5.0,
        total_listings: 0,
        created_at: res.user.created_at || new Date().toISOString(),
      });
    }
  };

  // 4. Sign Out
  const signOut = async () => {
    api.auth.logout();
    setUser(null);
    setProfile(null);
  };

  // 5. Password Reset Request
  const resetPassword = async (email: string) => {
    await api.auth.forgotPassword(email);
  };

  // 6. Update Password
  const updatePassword = async (newPassword: string, token?: string) => {
    if (!token) throw new Error('Password reset token is required.');
    await api.auth.resetPassword(token, newPassword);
  };

  // 7. Update Profile
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error('Must be logged in to update profile');
    const res = await api.auth.updateProfile(data);
    if (res?.user) {
      setProfile((prev) => ({
        ...prev!,
        ...res.user,
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isSupabaseConnected: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── useAuth Hook ─────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
