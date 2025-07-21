// app/(authenticated)/(modals)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        presentation: 'transparentModal',
        contentStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    />
  );
}