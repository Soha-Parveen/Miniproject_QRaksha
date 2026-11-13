import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinInput } from '../../components/PinInput';
import { setLoginPin, setTransactionPin } from '../../services/authService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

type Step = 'LOGIN_PIN' | 'CONFIRM_LOGIN_PIN' | 'TX_PIN' | 'CONFIRM_TX_PIN';

export default function CreatePinScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<Step>('LOGIN_PIN');
  const [loginPinFirst, setLoginPinFirst] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [txPinFirst, setTxPinFirst] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePinChange = async (pin: string) => {
    setCurrentPin(pin);
    setErrorMessage('');

    if (pin.length === 4) {
      if (step === 'LOGIN_PIN') {
        setLoginPinFirst(pin);
        setCurrentPin('');
        setStep('CONFIRM_LOGIN_PIN');
      } else if (step === 'CONFIRM_LOGIN_PIN') {
        if (pin === loginPinFirst) {
          await setLoginPin(pin);
          setCurrentPin('');
          setStep('TX_PIN');
        } else {
          setErrorMessage(t('auth.pinMismatch'));
          setCurrentPin('');
        }
      } else if (step === 'TX_PIN') {
        setTxPinFirst(pin);
        setCurrentPin('');
        setStep('CONFIRM_TX_PIN');
      } else if (step === 'CONFIRM_TX_PIN') {
        if (pin === txPinFirst) {
          await setTransactionPin(pin);
          Alert.alert(t('common.success'), t('auth.pinCreated'), [
            {
              text: t('common.continue'),
              onPress: () => router.replace('/(tabs)'),
            },
          ]);
        } else {
          setErrorMessage(t('auth.pinMismatch'));
          setCurrentPin('');
        }
      }
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'LOGIN_PIN':
        return t('auth.createLoginPin');
      case 'CONFIRM_LOGIN_PIN':
        return t('auth.confirmPin') + ' (Login)';
      case 'TX_PIN':
        return t('auth.createTxPin');
      case 'CONFIRM_TX_PIN':
        return t('auth.confirmPin') + ' (Transaction)';
    }
  };

  const getStepDesc = () => {
    switch (step) {
      case 'LOGIN_PIN':
        return t('auth.createLoginPinDesc');
      case 'CONFIRM_LOGIN_PIN':
        return 'Re-enter your 4-digit login PIN to confirm.';
      case 'TX_PIN':
        return t('auth.createTxPinDesc');
      case 'CONFIRM_TX_PIN':
        return 'Re-enter your 4-digit transaction PIN to confirm.';
    }
  };

  const getProgressIndicator = () => {
    const isStep1 = step === 'LOGIN_PIN' || step === 'CONFIRM_LOGIN_PIN';
    return (
      <View style={styles.progressRow}>
        <View style={[styles.progressBadge, isStep1 && styles.progressBadgeActive]}>
          <Text style={[styles.progressText, isStep1 && styles.progressTextActive]}>
            1. Login PIN
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} />
        <View style={[styles.progressBadge, !isStep1 && styles.progressBadgeActive]}>
          <Text style={[styles.progressText, !isStep1 && styles.progressTextActive]}>
            2. Transaction PIN
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {getProgressIndicator()}

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={step.includes('TX') ? 'credit-card-lock-outline' : 'shield-key-outline'}
              size={40}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.title}>{getStepTitle()}</Text>
          <Text style={styles.subtitle}>{getStepDesc()}</Text>
        </View>

        {errorMessage.length > 0 && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.dangerDark} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <PinInput pin={currentPin} onPinChange={handlePinChange} maxLength={4} />
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  progressTextActive: {
    color: '#FFFFFF',
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
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
});
