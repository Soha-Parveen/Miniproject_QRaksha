import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SafetyBadge } from '../../components/SafetyBadge';
import { speakText } from '../../services/voiceService';
import { getSettings } from '../../database/settingsRepo';
import { RiskCategory, LanguageCode } from '../../types';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function ReceiptScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{
    txId: string;
    txRef: string;
    receiverName: string;
    upiId: string;
    amount: string;
    riskCategory: string;
    status: string;
    createdAt: string;
  }>();

  const isSuccess = params.status === 'SUCCESS';
  const numAmount = parseFloat(params.amount || '0');

  useEffect(() => {
    try {
      Haptics.notificationAsync(
        isSuccess
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );

      const settings = getSettings();
      if (settings.voiceEnabled && isSuccess) {
        const text =
          i18n.language === 'hi'
            ? `${numAmount} रुपये का सिमुलेटेड भुगतान सफल रहा।`
            : i18n.language === 'kn'
            ? `${numAmount} ರೂಪಾಯಿಗಳ ಸಿಮ್ಯುಲೇಟೆಡ್ ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ.`
            : i18n.language === 'ml'
            ? `${numAmount} രൂപയുടെ ഡെമോ പേയ്‌മെന്റ് വിജയിച്ചു.`
            : `Simulated payment of ${numAmount} Rupees successful.`;

        speakText(text, i18n.language as LanguageCode);
      }
    } catch {}
  }, [isSuccess, numAmount, i18n.language]);

  const dateStr = params.createdAt
    ? new Date(params.createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-IN');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Receipt Card */}
        <View style={[styles.card, SHADOWS.lg]}>
          {/* Mandatory Demonstration Disclaimer Banner */}
          <View style={styles.disclaimerBanner}>
            <MaterialCommunityIcons name="alert-box-outline" size={16} color="#B45309" />
            <Text style={styles.disclaimerText}>
              DEMO TRANSACTION – NO REAL MONEY TRANSFERRED
            </Text>
          </View>

          {/* Success Check Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isSuccess
                  ? COLORS.safeLight
                  : COLORS.dangerLight,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isSuccess ? 'check-decagram' : 'close-octagon'}
              size={64}
              color={isSuccess ? COLORS.safeDark : COLORS.dangerDark}
            />
          </View>

          <Text style={styles.statusTitle}>
            {isSuccess
              ? t('receipt.successTitle')
              : t('receipt.failedTitle')}
          </Text>

          <Text style={styles.amountDisplay}>₹{numAmount.toFixed(2)}</Text>

          <Text style={styles.receiverDisplay}>
            {t('receipt.paidTo', {
              receiver: params.receiverName || params.upiId,
            })}
          </Text>

          {/* Receipt Data Table */}
          <View style={styles.table}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('receipt.txId')}</Text>
              <Text style={styles.rowValue}>{params.txRef || params.txId}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>UPI ID</Text>
              <Text style={styles.rowValue}>{params.upiId}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('receipt.dateTime')}</Text>
              <Text style={styles.rowValue}>{dateStr}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('receipt.riskRating')}</Text>
              <SafetyBadge
                category={(params.riskCategory as RiskCategory) || 'GREEN'}
                size="small"
              />
            </View>
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>{t('receipt.done')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => router.replace('/(tabs)/history')}
            activeOpacity={0.7}
          >
            <Text style={styles.historyButtonText}>{t('receipt.viewHistory')}</Text>
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    justifyContent: 'center',
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginLeft: 6,
    textAlign: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  amountDisplay: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: SPACING.xs,
  },
  receiverDisplay: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  table: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actions: {
    marginTop: SPACING.xl,
    width: '100%',
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historyButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: COLORS.primaryLight,
    fontSize: 15,
    fontWeight: '700',
  },
});
