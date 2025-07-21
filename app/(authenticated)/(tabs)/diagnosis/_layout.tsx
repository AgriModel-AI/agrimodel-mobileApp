// app/(authenticated)/(tabs)/diagnosis/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function DiagnosisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}