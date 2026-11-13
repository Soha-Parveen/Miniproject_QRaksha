import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function ForgotPinScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // In development mode, simulate or call backend
      const simulatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(simulatedOtp);
      setStep('OTP');
    } catch (err: any) {
      setErrorMessage('Failed to request recovery OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp !== devOtp) {
      setErrorMessage('Incorrect OTP. Please enter the valid code displayed.');
      return;
    }

    Alert.alert(
      'Recovery Verified',
      'Your identity has been verified. You may now create a new Login and Transaction PIN.',
      [
        {
          text: 'Proceed',
          onPress: () => router.replace('/(auth)/create-pin'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="cellphone-key" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{t('auth.forgotPinTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.forgotPinDesc')}</Text>
        </View>

        {errorMessage.length > 0 && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.dangerDark} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Development Mode Notice (Required by Section 5) */}
        <View style={styles.devBanner}>
          <MaterialCommunityIcons name="code-tags" size={18} color="#2563EB" />
          <Text style={styles.devBannerText}>
            Development Recovery Mode: Real SMS provider credentials not configured. OTP will be generated locally.
          </Text>
        </View>

        {step === 'PHONE' ? (
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Registered Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send Recovery OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            {devOtp && (
              <View style={styles.otpCard}>
                <Text style={styles.otpCardLabel}>DEVELOPMENT MODE OTP</Text>
                <Text style={styles.otpCardCode}>{devOtp}</Text>
                <Text style={styles.otpCardHint}>
                  In production, this OTP is sent via SMS. Enter it below to proceed.
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Enter 6-Digit OTP</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="••••••"
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleVerifyOtp}
              disabled={otp.length !== 6}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{t('auth.verifyOtp')}</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexGrow: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  devBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: SPACING.lg,
  },
  devBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
    lineHeight: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.md,
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
  formSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  countryCode: {
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  otpInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
    fontWeight: '700',
    marginBottom: SPACING.lg,
  },
  otpCard: {
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  otpCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 1,
    marginBottom: 4,
  },
  otpCardCode: {
    fontSize: 32,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 6,
    marginVertical: 4,
  },
  otpCardHint: {
    fontSize: 11,
    color: '#B45309',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
