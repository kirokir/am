import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import auth from '@react-native-firebase/auth';
import { Colors } from '../../lib/ColorTheme';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [confirm, setConfirm] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const signInWithPhoneNumber = async () => {
        if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
            Alert.alert("Invalid Phone Number", "Please enter in E.164 format (e.g., +14155552671).");
            return;
        }
        setLoading(true);
        try {
            const confirmation = await auth().signInWithPhoneNumber(phone);
            setConfirm(confirmation);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
        setLoading(false);
    };

    const confirmCode = async () => {
        setLoading(true);
        try {
            await confirm.confirm(code);
            // On success, the onIdTokenChanged listener in auth.tsx will handle the rest.
        } catch (error: any) {
            Alert.alert('Invalid Code', error.message);
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Amara</Text>
                <Text style={styles.subtitle}>Your relationship wellness space.</Text>

                {!confirm ? (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number (e.g., +1...)"
                            placeholderTextColor={Colors.secondaryText}
                            keyboardType="phone-pad"
                            onChangeText={setPhone}
                            value={phone}
                        />
                        <TouchableOpacity style={styles.button} onPress={signInWithPhoneNumber} disabled={loading}>
                            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Send Code</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Verification Code"
                            placeholderTextColor={Colors.secondaryText}
                            keyboardType="number-pad"
                            onChangeText={setCode}
                            value={code}
                        />
                        <TouchableOpacity style={styles.button} onPress={confirmCode} disabled={loading}>
                             {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Verify & Sign In</Text>}
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.indigo },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    title: { fontSize: 48, fontFamily: 'SF-Rounded-Bold', color: Colors.white, textAlign: 'center' },
    subtitle: { fontSize: 18, fontFamily: 'Inter-Regular', color: Colors.secondaryText, textAlign: 'center', marginBottom: 40 },
    input: { height: 50, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, color: Colors.white, fontSize: 16, fontFamily: 'Inter-SemiBold', marginBottom: 20 },
    button: { height: 50, backgroundColor: Colors.violet, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
});