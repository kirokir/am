import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Colors } from '../../lib/ColorTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// IMPORTANT: Replace this with the Web Client ID from your google-services.json file
// It's usually found under "client" -> "oauth_client" -> "client_id" where "client_type": 3
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE-SERVICES.JSON'; 

export default function LoginScreen() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Configure Google Sign-In. This only needs to be done once.
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: true, // Required for getting an idToken on Android
        });
    }, []);

    const onGoogleButtonPress = async () => {
        setLoading(true);
        try {
            // Check if the device has Google Play services installed and up to date
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            
            // Get the user's account details
            const { user } = await GoogleSignin.signIn();
            
            // Critical check: Ensure the idToken was returned
            if (!user.idToken) {
                throw new Error("Google Sign-In failed to provide an ID token.");
            }

            // Create a Firebase credential with the Google ID token
            const googleCredential = auth.GoogleAuthProvider.credential(user.idToken);

            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);
            // On a successful sign-in, the onIdTokenChanged listener in `lib/auth.tsx`
            // will automatically handle exchanging the token with Supabase and navigating the user.

        } catch (error: any) {
            // Handle specific sign-in errors
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("User cancelled the login flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Sign in is in progress already");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert("Error", "Google Play Services are not available or are out of date on this device.");
            } else {
                // Handle any other errors
                console.error("Google Sign-In Error", error);
                Alert.alert("Authentication Error", "An unexpected error occurred. Please try again.");
            }
        } finally {
            // Ensure the loading indicator is turned off
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Amara</Text>
                <Text style={styles.subtitle}>Your relationship wellness space.</Text>

                <TouchableOpacity style={styles.button} onPress={onGoogleButtonPress} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={Colors.darkText} />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="google" size={24} color={Colors.darkText} />
                            <Text style={styles.buttonText}>Sign in with Google</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.indigo },
    content: { flex: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 48, fontFamily: 'SF-Pro-Rounded-Bold', color: Colors.white, textAlign: 'center' },
    subtitle: { fontSize: 18, fontFamily: 'Inter-Regular', color: Colors.secondaryText, textAlign: 'center', marginBottom: 60 },
    button: {
        height: 55,
        backgroundColor: Colors.white,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: Colors.darkText,
        fontSize: 16,
        fontFamily: 'Inter-Bold',
        marginLeft: 12,
    },
});