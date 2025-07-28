import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../lib/ColorTheme';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TabIcon = ({ name, color, size, focused }: { name: any; color: string; size: number; focused: boolean }) => (
    <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={name} color={color} size={size} />
        {focused && <View style={styles.focusDot} />}
    </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.violet,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          height: 90,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        },
      }}>
      <Tabs.Screen
        name="couple"
        options={{
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="heart-multiple-outline" color={color} size={size} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="robot-outline" color={color} size={size} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    focusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: Colors.violet,
        marginTop: 6,
    }
});