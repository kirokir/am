import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import auth from '@react-native-firebase/auth';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  hasOnboarded: boolean;
  checkOnboardingStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  hasOnboarded: false,
  checkOnboardingStatus: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = auth().onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        // Call Supabase Edge Function to get a Supabase JWT
        const { data, error } = await supabase.functions.invoke('get-supabase-jwt', {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        if (error) {
          console.error('Error getting Supabase JWT:', error);
          setLoading(false);
          return;
        }

        // Set the Supabase session with the new token
        const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.accessToken,
            refresh_token: data.refreshToken, // This will be faked, Supabase handles it
        });
        
        if (sessionError) {
          console.error("Error setting Supabase session:", sessionError);
        }

      } else {
        // If Firebase user is null, sign out from Supabase as well
        await supabase.auth.signOut();
      }
    });

    // Listen for Supabase auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
            await checkOnboardingStatus(session.user.id);
        }
      }
    );

    return () => {
      unsubscribe();
      authSubscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    // A user is considered "onboarded" if they are part of a 'COUPLE' chat.
    const { data, error } = await supabase
      .from('chat_participants')
      .select('chats(chat_type)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking onboarding status:', error);
      setHasOnboarded(false);
      return;
    }

    const isOnboarded = data.some((p: any) => p.chats.chat_type === 'COUPLE');
    setHasOnboarded(isOnboarded);
  };
  
  const value = { session, loading, hasOnboarded, checkOnboardingStatus: () => checkOnboardingStatus(session!.user.id) };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}