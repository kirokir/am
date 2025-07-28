import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/ColorTheme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OnboardingScreen() {
    const { checkOnboardingStatus } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [userCode, setUserCode] = useState<string | null>(null);
    const [codeInput, setCodeInput] = useState('');

    // Fetch the user's existing invitation code on load
    useEffect(() => {
        const fetchUserCode = async () => {
            const { data, error } = await supabase.rpc('create_invitation_code');
            if (error) {
                // This might fail if user is already paired, which is fine.
                console.log("No existing code found, which is okay.");
            } else {
                setUserCode(data);
            }
            setIsLoading(false);
        };
        fetchUserCode();
    }, []);

    const handleAcceptInvitation = async () => {
        if (codeInput.length !== 6) {
            Alert.alert("Invalid Code", "Invitation codes are 6 characters long.");
            return;
        }
        setIsLoading(true);
        const { error } = await supabase.rpc('accept_invitation', {
            invitation_code_text: codeInput.toUpperCase(),
        });

        if (error) {
            Alert.alert("Pairing Error", error.message);
        } else {
            Alert.alert("Success!", "You are now paired. Welcome to Amara.");
            await checkOnboardingStatus(); // This will trigger the redirect to the main app
        }
        setIsLoading(false);
    };

    const onShare = async () => {
        if (!userCode) return;
        try {
            await Share.share({
                message: `Join me on Amara! It's a space for us to connect and grow together. My invitation code is: ${userCode}`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    if (isLoading) {
        return <View style={styles.container}><ActivityIndicator size="large" color={Colors.violet} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Let's Get Connected</Text>
                <Text style={styles.subtitle}>
                    To begin, one partner shares an invitation code with the other.
                </Text>
            </View>

            {/* Section to accept an invitation */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>I have an invitation code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter 6-character code"
                    placeholderTextColor={Colors.secondaryText}
                    value={codeInput}
                    onChangeText={setCodeInput}
                    maxLength={6}
                    autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.button} onPress={handleAcceptInvitation}>
                    <Text style={styles.buttonText}>Connect & Begin</Text>
                </TouchableOpacity>
            </View>
            
            {/* Divider */}
            <Text style={styles.divider}>OR</Text>

            {/* Section to create and share an invitation */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Invite your partner</Text>
                <Text style={styles.codeLabel}>Your unique invitation code is:</Text>
                <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{userCode || "..."}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onShare}>
                    <MaterialCommunityIcons name="share-variant" size={20} color={Colors.violet} />
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>Share Code</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.offGray, justifyContent: 'center', padding: 20 },
    header: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 32, fontFamily: 'SF-Rounded-Bold', color: Colors.darkText, textAlign: 'center' },
    subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: Colors.secondaryText, textAlign: 'center', marginTop: 8, maxWidth: '80%' },
    card: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 20 },
    cardTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: Colors.darkText, marginBottom: 16 },
    input: { height: 50, backgroundColor: Colors.offGray, borderRadius: 10, paddingHorizontal: 16, fontSize: 16, fontFamily: 'Inter-SemiBold', marginBottom: 16, textAlign: 'center' },
    button: { height: 50, backgroundColor: Colors.violet, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: Colors.white, fontSize: 16, fontFamily: 'Inter-Bold' },
    divider: { textAlign: 'center', fontFamily: 'Inter-Bold', color: Colors.secondaryText, marginVertical: 10 },
    codeLabel: { fontFamily: 'Inter-Regular', color: Colors.secondaryText, marginBottom: 8 },
    codeBox: { backgroundColor: Colors.offGray, borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 16 },
    codeText: { fontFamily: 'Inter-Bold', fontSize: 28, color: Colors.darkText, letterSpacing: 8 },
    secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.violet, flexDirection: 'row' },
    secondaryButtonText: { color: Colors.violet, marginLeft: 8 },
});