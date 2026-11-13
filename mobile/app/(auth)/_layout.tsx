import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-pin" />
    </Stack>
  );
}
