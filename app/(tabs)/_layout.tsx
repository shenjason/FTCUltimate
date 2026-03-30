// app/(tabs)/_layout.tsx
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useMatchStore } from '../../lib/store';

export default function TabLayout() {
  const matchStarted = useMatchStore((s) => s.matchStarted);
  const matchType = useMatchStore((s) => s.matchType);

  // Lock to portrait on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  const isLandscapeMatch =
    matchStarted && (matchType === 'solo' || matchType === 'full');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLandscapeMatch
          ? { display: 'none' }
          : {
              backgroundColor: '#0F0F0F',
              borderTopColor: '#2A2A2A',
            },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="match"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scouting"
        options={{
          title: 'Scouting',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
