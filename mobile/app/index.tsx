import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hasLoginPinSet } from '../services/authService';
import { COLORS, SPACING } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkState = async () => {
      try {
        const hasPin = await hasLoginPinSet();
        // Give a slight splash branding pause (1.2s)
        setTimeout(() => {
          if (hasPin) {
            router.replace('/(auth)/login');
          } else {
            router.replace('/(auth)/onboarding');
          }
        }, 1200);
      } catch (err) {
        console.error('[SplashScreen] Error:', err);
        router.replace('/(auth)/onboarding');
      }
    };

    checkState();
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="shield-check" size={54} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>QRaksha</Text>
        <Text style={styles.tagline}>Scan Smart. Pay Safe.</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#60A5FA" />
        <Text style={styles.footerText}>Smart Financial Security Shield</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xxxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 180,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 16,
    color: '#93C5FD',
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: SPACING.sm,
    letterSpacing: 0.5,
  },
});
