import React from 'react';
import { Slot, SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../lib/ColorTheme';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { session, loading, hasOnboarded } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        
        const inAuthGroup = segments[0] === '(auth)';
        const inOnboardingGroup = segments[0] === '(onboarding)';

        if (session && !hasOnboarded && !inOnboardingGroup) {
            router.replace('/(onboarding)/partner-select');
        } else if (session && hasOnboarded && (inAuthGroup || inOnboardingGroup)) {
            router.replace('/(tabs)/couple');
        } else if (!session && !inAuthGroup) {
            router.replace('/(auth)/login');
        }

        SplashScreen.hideAsync();
    }, [session, loading, hasOnboarded, segments]);

    if (loading) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.indigo }}><ActivityIndicator size="large" color={Colors.white} /></View>;
    }
    
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'SF-Rounded-Bold': require('../assets/fonts/SF-Pro-Rounded-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}