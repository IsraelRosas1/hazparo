import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import type { TradeType } from '../types';

type AuthCredentials = {
  email: string;
  password: string;
};

type ProfileRole = 'client' | 'tradesperson';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
  onboarding_completed: boolean;
};

type TradespersonProfile = {
  profile_id: string;
  trade: TradeType;
  bio: string | null;
  hourly_rate: number | null;
  years_experience: number;
  is_verified: boolean;
};

type CompleteOnboardingInput = {
  role: ProfileRole;
  trade?: TradeType;
};

type UpdateTradespersonProfileInput = {
  bio: string;
  hourlyRate: number;
  yearsExperience?: number;
};

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  tradespersonProfile: TradespersonProfile | null;
  isTradespersonProfileComplete: boolean;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signUp: (credentials: AuthCredentials) => Promise<{ hasSession: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (input: CompleteOnboardingInput) => Promise<void>;
  updateTradespersonProfile: (input: UpdateTradespersonProfileInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tradespersonProfile, setTradespersonProfile] = useState<TradespersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      const message = error.message ?? '';
      if (!message.includes('onboarding_completed')) {
        throw error;
      }

      const { data: legacyData, error: legacyError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .maybeSingle();

      if (legacyError) {
        throw legacyError;
      }

      if (!legacyData) {
        return null;
      }

      return {
        id: legacyData.id,
        email: legacyData.email,
        full_name: legacyData.full_name,
        role: legacyData.role,
        onboarding_completed: true,
      };
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      onboarding_completed: data.onboarding_completed,
    };
  };

  const ensureProfile = async (currentSession: Session) => {
    const existingProfile = await fetchProfile(currentSession.user.id);

    if (existingProfile) {
      setProfile(existingProfile);
      return;
    }

    const { error: insertError } = await supabase.from('profiles').insert({
      id: currentSession.user.id,
      email: currentSession.user.email ?? null,
      role: 'client',
      onboarding_completed: false,
    });

    if (insertError) {
      throw insertError;
    }

    const createdProfile = await fetchProfile(currentSession.user.id);
    setProfile(createdProfile);
  };

  const fetchTradespersonProfile = async (
    userId: string,
  ): Promise<TradespersonProfile | null> => {
    const { data, error } = await supabase
      .from('tradesperson_profiles')
      .select('profile_id, trade, bio, hourly_rate, years_experience, is_verified')
      .eq('profile_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      profile_id: data.profile_id,
      trade: data.trade,
      bio: data.bio,
      hourly_rate: data.hourly_rate,
      years_experience: data.years_experience,
      is_verified: data.is_verified,
    };
  };

  const refreshTradespersonProfile = async (userId: string, role: ProfileRole | null) => {
    if (role !== 'tradesperson') {
      setTradespersonProfile(null);
      return;
    }

    const nextTradespersonProfile = await fetchTradespersonProfile(userId);
    setTradespersonProfile(nextTradespersonProfile);
  };

  const refreshProfile = async () => {
    if (!session) {
      setProfile(null);
      setTradespersonProfile(null);
      return;
    }

    const nextProfile = await fetchProfile(session.user.id);
    setProfile(nextProfile);
    await refreshTradespersonProfile(session.user.id, nextProfile?.role ?? null);
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      const initialSession = data.session ?? null;

      if (isMounted) {
        setSession(initialSession);
      }

      if (initialSession) {
        await ensureProfile(initialSession);
        const nextProfile = await fetchProfile(initialSession.user.id);
        if (nextProfile) {
          setProfile(nextProfile);
          await refreshTradespersonProfile(initialSession.user.id, nextProfile.role);
        }
      } else if (isMounted) {
        setProfile(null);
        setTradespersonProfile(null);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    bootstrapSession().catch((error) => {
      if (isMounted) {
        setSession(null);
        setProfile(null);
        setTradespersonProfile(null);
        setIsLoading(false);
      }
      console.warn('Failed to bootstrap auth session', error);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const syncAuthState = async () => {
        if (!isMounted) {
          return;
        }

        setSession(nextSession);

        if (nextSession) {
          await ensureProfile(nextSession);
          const nextProfile = await fetchProfile(nextSession.user.id);
          if (nextProfile) {
            setProfile(nextProfile);
            await refreshTradespersonProfile(nextSession.user.id, nextProfile.role);
          }
        } else {
          setProfile(null);
          setTradespersonProfile(null);
        }
      };

      syncAuthState().catch((error) => {
        if (isMounted) {
          setProfile(null);
          setTradespersonProfile(null);
        }
        console.warn('Failed to sync auth state', error);
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      tradespersonProfile,
      isTradespersonProfileComplete: Boolean(
        tradespersonProfile &&
          tradespersonProfile.bio &&
          tradespersonProfile.bio.trim().length > 0 &&
          tradespersonProfile.hourly_rate &&
          tradespersonProfile.hourly_rate > 0,
      ),
      isLoading,
      signIn: async ({ email, password }) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }
      },
      signUp: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          throw error;
        }

        return { hasSession: Boolean(data.session) };
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      },
      refreshProfile,
      completeOnboarding: async ({ role, trade }) => {
        if (!session) {
          throw new Error('No active session for onboarding.');
        }

        if (role === 'tradesperson' && !trade) {
          throw new Error('Selecciona un oficio para el perfil profesional.');
        }

        const userId = session.user.id;

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role, onboarding_completed: true })
          .eq('id', userId);

        if (profileError) {
          throw profileError;
        }

        if (role === 'tradesperson') {
          const { error: clearClientProfileError } = await supabase
            .from('client_profiles')
            .delete()
            .eq('profile_id', userId);

          if (clearClientProfileError) {
            throw clearClientProfileError;
          }

          const { error: tradespersonError } = await supabase.from('tradesperson_profiles').upsert(
            {
              profile_id: userId,
              trade,
            },
            { onConflict: 'profile_id' },
          );

          if (tradespersonError) {
            throw tradespersonError;
          }
        } else {
          const { error: clientProfileError } = await supabase.from('client_profiles').upsert(
            {
              profile_id: userId,
            },
            { onConflict: 'profile_id' },
          );

          if (clientProfileError) {
            throw clientProfileError;
          }

          const { error: cleanupError } = await supabase
            .from('tradesperson_profiles')
            .delete()
            .eq('profile_id', userId);

          if (cleanupError) {
            throw cleanupError;
          }
        }

        await refreshProfile();
      },
      updateTradespersonProfile: async ({ bio, hourlyRate, yearsExperience }) => {
        if (!session) {
          throw new Error('No active session.');
        }

        if (profile?.role !== 'tradesperson') {
          throw new Error('Solo perfiles profesionales pueden actualizar estos datos.');
        }

        const trade = tradespersonProfile?.trade;
        if (!trade) {
          throw new Error('Selecciona un oficio desde onboarding antes de continuar.');
        }

        const { error } = await supabase.from('tradesperson_profiles').upsert(
          {
            profile_id: session.user.id,
            trade,
            bio,
            hourly_rate: hourlyRate,
            years_experience: yearsExperience ?? tradespersonProfile?.years_experience ?? 0,
          },
          { onConflict: 'profile_id' },
        );

        if (error) {
          throw error;
        }

        await refreshProfile();
      },
    }),
    [isLoading, profile, session, tradespersonProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
