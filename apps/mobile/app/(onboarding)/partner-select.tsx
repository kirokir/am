import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/ColorTheme';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

type UserProfile = { id: string; phone_number: string };

export default function PartnerSelectScreen() {
    const { checkOnboardingStatus } = useAuth();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (search.length < 5) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('id, phone_number')
            .like('phone_number', `%${search}%`)
            .limit(5);
        if (error) Alert.alert("Search Error", error.message);
        setResults(data || []);
        setLoading(false);
    };

    const handleSelectPartner = (partnerId: string) => {
        Alert.alert(
            "Confirm Partner",
            "Are you sure you want to pair with this user? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        setLoading(true);
                        const { error } = await supabase.functions.invoke('create-couple-chats', {
                            body: { partnerId },
                        });
                        setLoading(false);
                        if (error) {
                            Alert.alert("Pairing Error", error.message);
                        } else {
                            Alert.alert("Success!", "You are now paired. Welcome to Amara.");
                            await checkOnboardingStatus(); // This will trigger the redirect in _layout
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Find Your Partner</Text>
            <Text style={styles.subtitle}>Search for your partner by their full phone number.</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Search phone number..."
                    onChangeText={setSearch}
                    value={search}
                    keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.buttonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color={Colors.violet} style={{marginTop: 20}} />}

            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectPartner(item.id)}>
                        <Text style={styles.resultText}>{item.phone_number}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.offGray, padding: 24 },
    title: { fontSize: 32, fontFamily: 'SF-Rounded-Bold', color: Colors.darkText, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, fontFamily: 'Inter-Regular', color: Colors.secondaryText, textAlign: 'center', marginBottom: 24 },
    searchContainer: { flexDirection: 'row', marginBottom: 24 },
    input: { flex: 1, height: 50, backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
    searchButton: { height: 50, backgroundColor: Colors.violet, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    buttonText: { color: Colors.white, fontFamily: 'Inter-Bold' },
    resultItem: { backgroundColor: Colors.white, padding: 20, borderRadius: 12, marginBottom: 10 },
    resultText: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: Colors.darkText },
});