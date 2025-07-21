// app/(onboarding)/_layout.tsx
import useSocket from '@/hooks/useSocket';
import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  useSocket();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}