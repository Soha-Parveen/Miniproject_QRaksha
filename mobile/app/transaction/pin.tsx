import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinInput } from '../../components/PinInput';
import { verifyTransactionPin } from '../../services/authService';
import { executeSimulatedPayment } from '../../database/walletRepo';
import { RiskCategory } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function TransactionPinScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    receiverName: string;
    upiId: string;
    amount: string;
    currency: string;
    transactionNote: string;
    riskCategory: string;
    riskScore: string;
    riskReasons: string;
  }>();

  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const numAmount = parseFloat(params.amount || '0');
  const reasons: string[] = params.riskReasons ? JSON.parse(params.riskReasons) : [];

  const handlePinChange = async (newPin: string) => {
    setPin(newPin);
    setErrorMessage('');

    if (newPin.length === 4) {
      setProcessing(true);

      try {
        // 1. Verify Transaction PIN against stored hash
        const isPinValid = await verifyTransactionPin(newPin);

        if (!isPinValid) {
          setErrorMessage(t('pin.incorrect'));
          setPin('');
          setProcessing(false);
          return;
        }

        // 2. Execute simulated payment
        const result = executeSimulatedPayment({
          receiverName: params.receiverName || 'Unknown Merchant',
          upiId: params.upiId || 'unspecified@upi',
          amount: numAmount,
          currency: params.currency || 'INR',
          transactionNote: params.transactionNote,
          riskCategory: (params.riskCategory as RiskCategory) || 'GREEN',
          riskScore: parseInt(params.riskScore || '0', 10),
          riskReasons: reasons,
          transactionPin: newPin,
        });

        if (result.success && result.transaction) {
          router.replace({
            pathname: '/transaction/receipt',
            params: {
              txId: result.transaction.id,
              txRef: result.transaction.transactionRef,
              receiverName: result.transaction.receiverName,
              upiId: result.transaction.upiId,
              amount: result.transaction.amount.toString(),
              riskCategory: result.transaction.riskCategory,
              status: result.transaction.status,
              createdAt: result.transaction.createdAt,
            },
          });
        } else {
          Alert.alert(
            'Payment Unsuccessful',
            result.error || 'The payment could not be processed.',
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );
        }
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Payment execution failed.');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="credit-card-lock" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{t('pin.title')}</Text>
          <Text style={styles.amountText}>₹{numAmount.toFixed(2)}</Text>
          <Text style={styles.receiverText}>
            Paying {params.receiverName || params.upiId}
          </Text>
        </View>

        {errorMessage.length > 0 && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle" size={18} color={COLORS.dangerDark} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {processing ? (
          <View style={styles.processingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.processingText}>{t('pin.submitting')}</Text>
          </View>
        ) : (
          <PinInput
            pin={pin}
            onPinChange={handlePinChange}
            maxLength={4}
            disabled={processing}
          />
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
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 4,
  },
  receiverText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
  processingBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
