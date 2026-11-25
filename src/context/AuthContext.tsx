import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  establishOtpSession: (email: string, fullName?: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OTP_SESSION_KEY = 'mmu_otp_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, authUser?: User | null): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      // If profile row doesn't exist yet for an authenticated user, create it
      if (authUser) {
        const cleanEmail = (authUser.email || '').toLowerCase().trim();
        const role: 'customer' | 'admin' =
          cleanEmail === 'admin@madanmehandi.com' || cleanEmail === 'rs5621614@gmail.com'
            ? 'admin'
            : 'customer';
        const fullName =
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          cleanEmail.split('@')[0] ||
          'Valued Customer';
        const avatarUrl =
          authUser.user_metadata?.avatar_url ||
          authUser.user_metadata?.picture ||
          null;

        const newProfile: Profile = {
          id: userId,
          email: cleanEmail,
          full_name: fullName,
          phone: authUser.phone || null,
          role,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
        setProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
    return null;
  };

  const restoreCustomOtpSession = (): boolean => {
    try {
      const raw = localStorage.getItem(OTP_SESSION_KEY);
      if (!raw) return false;
      const savedProfile: Profile = JSON.parse(raw);
      if (savedProfile && savedProfile.id && savedProfile.email) {
        const syntheticUser = {
          id: savedProfile.id,
          email: savedProfile.email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: { provider: 'email_otp' },
          user_metadata: { full_name: savedProfile.full_name },
          created_at: savedProfile.created_at || new Date().toISOString(),
        } as unknown as User;
        setUser(syntheticUser);
        setProfile(savedProfile);
        return true;
      }
    } catch (_) {}
    return false;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (initSession?.user) {
        setSession(initSession);
        setUser(initSession.user);
        fetchProfile(initSession.user.id, initSession.user).finally(() => setLoading(false));
      } else {
        restoreCustomOtpSession();
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id, newSession.user);
        } else {
          setSession(null);
          if (!restoreCustomOtpSession()) {
            setUser(null);
            setProfile(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async (redirectTo?: string): Promise<{ error: Error | null }> => {
    try {
      localStorage.setItem('mmu_google_oauth_pending', String(Date.now()));
    } catch (_) {}

    const targetUrl = redirectTo || `${window.location.origin}/login?google_callback=true`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: targetUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { error: error as Error | null };
  };

  const signInWithOtp = async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    return { error: error as Error | null };
  };

  const verifyOtp = async (email: string, token: string): Promise<{ error: Error | null }> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { error: error as Error | null };
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      await fetchProfile(data.user.id, data.user);
    }
    return { error: null };
  };

  /**
   * Establish an authenticated user session after custom SMTP OTP verification
   */
  const establishOtpSession = async (email: string, fullName?: string): Promise<Profile> => {
    const cleanEmail = email.toLowerCase().trim();
    const role: 'customer' | 'admin' =
      cleanEmail === 'admin@madanmehandi.com' || cleanEmail === 'rs5621614@gmail.com'
        ? 'admin'
        : 'customer';

    // Check if an existing profile exists by email
    let existingProfile: Profile | null = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) {
        existingProfile = data as Profile;
      }
    } catch (_) {}

    // Or check if we already have an ID in localStorage for this email
    let fallbackId = existingProfile?.id;
    if (!fallbackId) {
      try {
        const prev = localStorage.getItem(OTP_SESSION_KEY);
        if (prev) {
          const parsed = JSON.parse(prev);
          if (parsed?.email === cleanEmail && parsed?.id) {
            fallbackId = parsed.id;
          }
        }
      } catch (_) {}
    }
    if (!fallbackId) {
      fallbackId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'b4f9fd46-a40d-4ffa-b627-a4ac2c2d2cb5';
    }

    const activeProfile: Profile = existingProfile || {
      id: fallbackId,
      email: cleanEmail,
      full_name: fullName || cleanEmail.split('@')[0] || 'Valued Customer',
      phone: null,
      role,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem(OTP_SESSION_KEY, JSON.stringify(activeProfile));
    } catch (_) {}

    const syntheticUser = {
      id: activeProfile.id,
      email: activeProfile.email,
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email_otp' },
      user_metadata: { full_name: activeProfile.full_name },
      created_at: activeProfile.created_at,
    } as unknown as User;

    setUser(syntheticUser);
    setProfile(activeProfile);
    return activeProfile;
  };

  const signOut = async (): Promise<void> => {
    try {
      localStorage.removeItem(OTP_SESSION_KEY);
      localStorage.removeItem('mmu_google_oauth_pending');
    } catch (_) {}
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async (): Promise<void> => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const targetUser = currentSession?.user || user;
    if (targetUser) {
      await fetchProfile(targetUser.id, targetUser);
    }
  };

  const isAdmin =
    profile?.role === 'admin' ||
    user?.email === 'admin@madanmehandi.com' ||
    user?.email === 'rs5621614@gmail.com';

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signIn,
    signInWithGoogle,
    signInWithOtp,
    verifyOtp,
    establishOtpSession,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
