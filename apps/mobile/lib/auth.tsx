import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import auth from '@react-native-firebase/auth';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  hasOnboarded: boolean;
  checkOnboardingStatus: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const { data: { subscription: authStateSubscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.id !== getSession()?.user?.id) {
            setSession(session);
        }
        if (session) {
            await checkOnboardingStatus(session.user.id);
        }
        setLoading(false);
      }
    );

    const idTokenListener = auth().onIdTokenChanged(async (user) => {
      if (user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        const { data, error } = await supabase.functions.invoke('get-supabase-jwt', {
          body: { idToken },
        });

        if (error) {
          console.error("Error exchanging Firebase token for Supabase session:", error);
          await auth().signOut();
        } else {
          setSession(data);
          if (data.user) {
              await checkOnboardingStatus(data.user.id);
          }
        }
        setLoading(false);
      }
    });

    const getSession = () => session;

    return () => {
      authStateSubscription.unsubscribe();
      idTokenListener();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_couple_chat_details');
    if (error) {
      console.log('Onboarding check error (this is normal for new users):', error.message);
      setHasOnboarded(false);
      return;
    }
    setHasOnboarded(!!data && data.length > 0);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await auth().signOut();
    setSession(null);
    setHasOnboarded(false);
  };

  const value = { session, loading, hasOnboarded, checkOnboardingStatus: () => checkOnboardingStatus(session!.user.id), signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}