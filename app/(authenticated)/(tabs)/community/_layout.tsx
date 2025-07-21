// app/(authenticated)/(tabs)/community/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function CommunityLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}