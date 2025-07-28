import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../lib/ColorTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChatHeaderProps {
    title: string;
    subtitle: string;
    iconName: any;
}

export function ChatHeader({ title, subtitle, iconName }: ChatHeaderProps) {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.innerContainer}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name={iconName} size={28} color={Colors.violet} />
                </View>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0EFFF', // A light violet
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontFamily: 'SF-Rounded-Bold',
        color: Colors.darkText,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Colors.secondaryText,
    },
});