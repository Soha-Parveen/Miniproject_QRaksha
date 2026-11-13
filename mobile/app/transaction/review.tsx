import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SafetyBadge } from '../../components/SafetyBadge';
import { analyzeQRCode } from '../../services/fraudEngine';
import {
  speakText,
  buildTransactionAnnouncement,
  stopSpeech,
} from '../../services/voiceService';
import { getSettings } from '../../database/settingsRepo';
import { QRAnalysisResult, LanguageCode } from '../../types';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function TransactionReviewScreen() {
  const router = useRouter();
  const { qrData } = useLocalSearchParams<{ qrData: string }>();
  const { t, i18n } = useTranslation();

  const [analysis, setAnalysis] = useState<QRAnalysisResult | null>(null);
  const [customAmount, setCustomAmount] = useState('100.00');
  const [cautionAcknowledged, setCautionAcknowledged] = useState(false);
  const [highValueAcknowledged, setHighValueAcknowledged] = useState(false);

  useEffect(() => {
    if (!qrData) return;

    try {
      const settings = getSettings();
      const result = analyzeQRCode(qrData, settings.highValueThreshold);
      setAnalysis(result);

      if (result.parsedParams.am) {
        setCustomAmount(result.parsedParams.am);
      }

      // Voice Announcement in user's active language
      if (settings.voiceEnabled) {
        const amt = result.parsedParams.am
          ? parseFloat(result.parsedParams.am)
          : 100;
        const announcement = buildTransactionAnnouncement(
          result.parsedParams.pn,
          amt,
          i18n.language as LanguageCode
        );
        speakText(announcement, i18n.language as LanguageCode);
      }
    } catch (err) {
      console.warn('[Review] Error during analysis:', err);
    }

    return () => {
      stopSpeech();
    };
  }, [qrData, i18n.language]);

  const handlePlayVoiceAgain = () => {
    if (!analysis) return;
    const amt = parseFloat(customAmount) || 100;
    const announcement = buildTransactionAnnouncement(
      analysis.parsedParams.pn,
      amt,
      i18n.language as LanguageCode
    );
    speakText(announcement, i18n.language as LanguageCode);
  };

  const handleProceedToPin = () => {
    if (!analysis) return;

    // Check critical risk block
    if (analysis.category === 'RED') {
      Alert.alert(
        'Transaction Blocked',
        'Payments for high-risk QR codes are blocked to protect your funds.'
      );
      return;
    }

    // Check caution acknowledgement
    if (analysis.category === 'YELLOW' && !cautionAcknowledged) {
      Alert.alert(
        'Caution Required',
        'Please review the warnings and check the acknowledgement box before proceeding.'
      );
      return;
    }

    // Check high value acknowledgement
    if (analysis.isHighValue && !highValueAcknowledged) {
      Alert.alert(
        'High-Value Warning',
        'Please explicitly confirm that you wish to proceed with this high-value payment.'
      );
      return;
    }

    const finalAmount = parseFloat(customAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    // Stop speech before navigating
    stopSpeech();

    router.push({
      pathname: '/transaction/pin',
      params: {
        receiverName: analysis.parsedParams.pn || 'Unknown Merchant',
        upiId: analysis.parsedParams.pa || 'unspecified@upi',
        amount: finalAmount.toString(),
        currency: analysis.parsedParams.cu || 'INR',
        transactionNote: analysis.parsedParams.tn || '',
        riskCategory: analysis.category,
        riskScore: analysis.score.toString(),
        riskReasons: JSON.stringify(analysis.indicators.map((i) => i.descriptionKey)),
      },
    });
  };

  if (!analysis) {
    return (
      <View style={styles.centerContainer}>
        <Text>Analyzing QR code...</Text>
      </View>
    );
  }

  const isBlocked = analysis.category === 'RED';
  const effectiveAmount = parseFloat(customAmount) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('analysis.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Safety Indicator Banner */}
        <View
          style={[
            styles.safetyBanner,
            {
              backgroundColor:
                analysis.category === 'GREEN'
                  ? COLORS.safeLight
                  : analysis.category === 'YELLOW'
                  ? COLORS.cautionLight
                  : COLORS.dangerLight,
              borderColor:
                analysis.category === 'GREEN'
                  ? COLORS.safeBorder
                  : analysis.category === 'YELLOW'
                  ? COLORS.cautionBorder
                  : COLORS.dangerBorder,
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <SafetyBadge category={analysis.category} size="large" />
            <Text style={styles.scoreText}>Risk Score: {analysis.score}/100</Text>
          </View>

          <Text style={styles.safetyMessage}>{t(analysis.summaryKey)}</Text>
          <Text style={styles.safetyDesc}>{t(analysis.recommendationKey)}</Text>
        </View>

        {/* Voice Announcement Pill */}
        <TouchableOpacity style={styles.voicePill} onPress={handlePlayVoiceAgain}>
          <MaterialCommunityIcons name="volume-high" size={22} color={COLORS.primary} />
          <Text style={styles.voicePillText}>{t('review.readAloud')}</Text>
        </TouchableOpacity>

        {/* Payment Details Card */}
        <View style={[styles.detailsCard, SHADOWS.sm]}>
          <Text style={styles.cardHeaderTitle}>Payment Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('analysis.receiver')}:</Text>
            <Text style={[styles.infoValue, !analysis.parsedParams.pn && styles.missingValue]}>
              {analysis.parsedParams.pn || t('analysis.missingName')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('analysis.vpa')}:</Text>
            <Text style={styles.infoValue}>{analysis.parsedParams.pa || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('analysis.amount')}:</Text>
            {analysis.parsedParams.am ? (
              <Text style={styles.amountValue}>₹{parseFloat(analysis.parsedParams.am).toFixed(2)}</Text>
            ) : (
              <View style={styles.amountInputRow}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {analysis.parsedParams.tn && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('analysis.note')}:</Text>
              <Text style={styles.infoValue}>{analysis.parsedParams.tn}</Text>
            </View>
          )}
        </View>

        {/* Risk Indicators Breakdown */}
        {analysis.indicators.length > 0 && (
          <View style={styles.indicatorsSection}>
            <Text style={styles.sectionTitle}>Security Check Breakdown</Text>
            {analysis.indicators.map((item, idx) => (
              <View key={idx} style={styles.indicatorItem}>
                <MaterialCommunityIcons
                  name={
                    item.category === 'RED'
                      ? 'close-octagon'
                      : item.category === 'YELLOW'
                      ? 'alert'
                      : 'check-circle'
                  }
                  size={20}
                  color={
                    item.category === 'RED'
                      ? COLORS.dangerDark
                      : item.category === 'YELLOW'
                      ? COLORS.cautionDark
                      : COLORS.safeDark
                  }
                />
                <View style={styles.indicatorTextWrapper}>
                  <Text style={styles.indicatorDesc}>{item.descriptionKey}</Text>
                  {item.detail && <Text style={styles.indicatorDetail}>{item.detail}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* High-Value Transaction Warning Box */}
        {analysis.isHighValue && (
          <View style={styles.highValueBox}>
            <MaterialCommunityIcons name="alert-decagram" size={24} color={COLORS.cautionDark} />
            <View style={styles.highValueTextCol}>
              <Text style={styles.highValueTitle}>High-Value Payment Warning</Text>
              <Text style={styles.highValueText}>
                This transaction (₹{effectiveAmount.toLocaleString('en-IN')}) exceeds your threshold of ₹
                {analysis.highValueThreshold.toLocaleString('en-IN')}.
              </Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setHighValueAcknowledged(!highValueAcknowledged)}
              >
                <MaterialCommunityIcons
                  name={highValueAcknowledged ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>I acknowledge this high-value transfer.</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caution Acknowledgement Checkbox */}
        {analysis.category === 'YELLOW' && (
          <TouchableOpacity
            style={styles.cautionCheckboxCard}
            onPress={() => setCautionAcknowledged(!cautionAcknowledged)}
          >
            <MaterialCommunityIcons
              name={cautionAcknowledged ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.cautionCheckboxText}>
              {t('review.cautionAcknowledge')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Blocked Red Notice */}
        {isBlocked && (
          <View style={styles.blockedNotice}>
            <MaterialCommunityIcons name="lock" size={24} color={COLORS.dangerDark} />
            <Text style={styles.blockedNoticeText}>
              {t('review.blockedMessage')}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {!isBlocked ? (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleProceedToPin}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{t('review.confirmAndPay')}</Text>
              <MaterialCommunityIcons name="lock-check" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  safetyBanner: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  safetyMessage: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  safetyDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  voicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  voicePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  missingValue: {
    color: COLORS.cautionDark,
    fontStyle: 'italic',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 4,
  },
  amountInput: {
    width: 80,
    height: 36,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  indicatorsSection: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  indicatorTextWrapper: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  indicatorDesc: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  indicatorDetail: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  highValueBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cautionLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cautionBorder,
    marginBottom: SPACING.md,
  },
  highValueTextCol: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  highValueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.cautionDark,
  },
  highValueText: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  cautionCheckboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  cautionCheckboxText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  blockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    marginBottom: SPACING.md,
  },
  blockedNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dangerDark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  actionsContainer: {
    marginTop: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: SPACING.xs,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
