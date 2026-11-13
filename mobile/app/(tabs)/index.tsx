import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceCard } from '../../components/BalanceCard';
import { TransactionCard } from '../../components/TransactionCard';
import { SecurityTipCard } from '../../components/SecurityTipCard';
import { getWalletBalance, addDemoFunds } from '../../database/walletRepo';
import { getRecentTransactions } from '../../database/transactionRepo';
import { PaymentTransaction } from '../../types';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [balance, setBalance] = useState(10000.00);
  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    try {
      const currentBalance = getWalletBalance();
      const recent = getRecentTransactions(5);
      setBalance(currentBalance);
      setRecentTransactions(recent);
    } catch (err) {
      console.warn('[Dashboard] Load error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const handleAddFunds = () => {
    const updated = addDemoFunds(5000);
    setBalance(updated);
    Alert.alert(
      t('common.success'),
      '₹5,000 demonstration money added to your dummy wallet!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>{t('dashboard.greeting')}</Text>
            <Text style={styles.appName}>QRaksha Shield Active</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.safeDark} />
          </TouchableOpacity>
        </View>

        {/* Dummy Wallet Balance Card */}
        <BalanceCard balance={balance} onAddFunds={handleAddFunds} />

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconCircle}>
              <MaterialCommunityIcons name="camera-iris" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.actionCardTitle}>{t('dashboard.scanQrNow')}</Text>
            <Text style={styles.actionCardSubtitle}>Real-time heuristic check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }]}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <MaterialCommunityIcons name="image-search-outline" size={26} color={COLORS.primary} />
            </View>
            <Text style={[styles.actionCardTitle, { color: COLORS.textPrimary }]}>
              {t('dashboard.selectFromGallery')}
            </Text>
            <Text style={[styles.actionCardSubtitle, { color: COLORS.textSecondary }]}>
              Scan from screenshot
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Shield Status Banner */}
        <View style={styles.shieldStatusBanner}>
          <MaterialCommunityIcons name="shield-account" size={28} color={COLORS.safeDark} />
          <View style={styles.shieldTextWrapper}>
            <Text style={styles.shieldTitle}>{t('dashboard.securityStatus')}</Text>
            <Text style={styles.shieldDesc}>{t('dashboard.securityStatusDesc')}</Text>
          </View>
        </View>

        {/* Safety Tip Card */}
        <SecurityTipCard />

        {/* Recent Activity Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentScans')}</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="qrcode-remove" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyStateText}>
              {t('dashboard.noTransactions')}
            </Text>
          </View>
        ) : (
          recentTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onPress={() => router.push('/(tabs)/history')}
            />
          ))
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.safeLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    justifyContent: 'space-between',
    minHeight: 125,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: '#93C5FD',
    marginTop: 2,
  },
  shieldStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.safeLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.safeBorder,
    marginVertical: SPACING.sm,
  },
  shieldTextWrapper: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  shieldTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.safeDark,
  },
  shieldDesc: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
});
