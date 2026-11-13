import React from 'react';
import { Stack } from 'expo-router';

export default function TransactionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="review" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="receipt" />
    </Stack>
  );
}
