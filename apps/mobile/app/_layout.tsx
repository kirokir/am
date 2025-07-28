import React from 'react';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../lib/auth';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../lib/ColorTheme';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { session, loading, hasOnboarded } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inApp = segments[0] === '(tabs)';
        const inOnboarding = segments[0] === '(onboarding)';
        
        if (session && !hasOnboarded && !inOnboarding) {
            router.replace('/(onboarding)');
        } else if (session && hasOnboarded && !inApp) {
            router.replace('/(tabs)/couple');
        } else if (!session) {
            router.replace('/(auth)/login');
        }

        SplashScreen.hideAsync();
    }, [session, loading, hasOnboarded, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.indigo }}>
                <ActivityIndicator size="large" color={Colors.white} />
            </View>
        );
    }
    
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
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
    'SF-Pro-Rounded-Bold': require('../assets/fonts/SF-Pro-Rounded-Bold.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <InitialLayout />
    </AuthProvider>
  );
}