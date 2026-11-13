import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { paperTheme, COLORS } from '../constants/theme';
import { getDatabase } from '../database/db';
import { getSettings } from '../database/settingsRepo';
import i18n, { changeAppLanguage } from '../locales/i18n';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // 1. Initialize local SQLite database & tables
      getDatabase();

      // 2. Load stored language settings
      const settings = getSettings();
      if (settings?.language) {
        changeAppLanguage(settings.language);
      }
    } catch (error) {
      console.error('[RootLayout] Initialization error:', error);
    } finally {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="transaction" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
