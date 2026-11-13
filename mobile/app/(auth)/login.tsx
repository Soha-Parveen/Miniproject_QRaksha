import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinInput } from '../../components/PinInput';
import {
  verifyLoginPin,
  getLockoutStatus,
  checkBiometricSupport,
  authenticateBiometrics,
} from '../../services/authService';
import { getSettings } from '../../database/settingsRepo';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Check biometric support & lockout status on mount
  useEffect(() => {
    let timer: any;

    const checkLockout = async () => {
      const status = await getLockoutStatus();
      if (status.isLocked) {
        setLockoutSeconds(status.secondsRemaining);
      }
    };

    const checkBio = async () => {
      const settings = getSettings();
      const bio = await checkBiometricSupport();
      if (bio.hasHardware && bio.isEnrolled && settings.biometricEnabled) {
        setBiometricAvailable(true);
        // Prompt biometrics automatically on launch if enabled
        handleBiometricAuth();
      } else if (bio.hasHardware && bio.isEnrolled) {
        // Hardware available even if not enabled by default
        setBiometricAvailable(true);
      }
    };

    checkLockout();
    checkBio();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    let timer: any;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setErrorMessage('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutSeconds]);

  const handleBiometricAuth = async () => {
    const success = await authenticateBiometrics(t('auth.biometricPrompt'));
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handlePinChange = async (newPin: string) => {
    if (lockoutSeconds > 0) return;

    setPin(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      const result = await verifyLoginPin(newPin);
      if (result.valid) {
        router.replace('/(tabs)');
      } else {
        setPin('');
        if (result.attemptsRemaining === 0) {
          const status = await getLockoutStatus();
          setLockoutSeconds(status.secondsRemaining || 30);
          setErrorMessage(
            t('auth.lockedOut', { seconds: status.secondsRemaining || 30 })
          );
        } else {
          setErrorMessage(
            t('auth.incorrectPin', { remaining: result.attemptsRemaining })
          );
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="shield-lock" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{t('auth.loginTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        {/* Lockout or Error Banner */}
        {lockoutSeconds > 0 ? (
          <View style={styles.lockoutBox}>
            <MaterialCommunityIcons name="timer-sand" size={20} color={COLORS.dangerDark} />
            <Text style={styles.lockoutText}>
              {t('auth.lockedOut', { seconds: lockoutSeconds })}
            </Text>
          </View>
        ) : errorMessage.length > 0 ? (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.dangerDark} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* PIN Input & Keypad */}
        <PinInput
          pin={pin}
          onPinChange={handlePinChange}
          maxLength={4}
          disabled={lockoutSeconds > 0}
        />

        {/* Actions Row */}
        <View style={styles.actionRow}>
          {biometricAvailable && lockoutSeconds === 0 && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="fingerprint" size={28} color={COLORS.primary} />
              <Text style={styles.biometricText}>{t('auth.useBiometrics')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push('/(auth)/forgot-pin')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>{t('auth.forgotPin')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.dangerDark,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  lockoutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    marginBottom: SPACING.md,
  },
  lockoutText: {
    color: COLORS.dangerDark,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  actionRow: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  forgotButton: {
    padding: SPACING.sm,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
