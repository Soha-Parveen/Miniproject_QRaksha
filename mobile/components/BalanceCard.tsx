import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface BalanceCardProps {
  balance: number;
  onAddFunds: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, onAddFunds }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.card, SHADOWS.md]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <MaterialCommunityIcons name="shield-check" size={16} color="#60A5FA" />
          <Text style={styles.badgeText}>DEMO WALLET</Text>
        </View>
        <Text style={styles.currencyLabel}>INR (₹)</Text>
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceSubtext}>{t('dashboard.walletCardTitle')}</Text>
        <Text style={styles.balanceAmount}>
          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Action and Disclaimer */}
      <View style={styles.footer}>
        <Text style={styles.disclaimerText}>
          {t('dashboard.walletSubtitle')}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddFunds}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={16} color={COLORS.primary} />
          <Text style={styles.addButtonText}>{t('dashboard.addFunds')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.8,
  },
  currencyLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: SPACING.lg,
  },
  balanceSubtext: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  balanceAmount: {
    color: COLORS.textInverse,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
    marginRight: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
