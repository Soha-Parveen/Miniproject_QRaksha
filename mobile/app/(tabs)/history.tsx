import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionCard } from '../../components/TransactionCard';
import { SafetyBadge } from '../../components/SafetyBadge';
import { getAllTransactions } from '../../database/transactionRepo';
import { PaymentTransaction } from '../../types';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function HistoryScreen() {
  const { t } = useTranslation();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'BLOCKED'>('ALL');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  const loadTransactions = useCallback(() => {
    try {
      const data = getAllTransactions(statusFilter, searchQuery);
      setTransactions(data);
    } catch (err) {
      console.warn('[History] Query error:', err);
    }
  }, [statusFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('history.title')}</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('history.searchPlaceholder')}
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersRow}>
        {(['ALL', 'SUCCESS', 'BLOCKED'] as const).map((filter) => {
          const isActive = statusFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter === 'ALL'
                  ? t('history.all')
                  : filter === 'SUCCESS'
                  ? t('history.success')
                  : t('history.blocked')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={() => setSelectedTx(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-clock-outline"
              size={54}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>{t('history.empty')}</Text>
          </View>
        }
      />

      {/* Detailed Receipt Modal */}
      <Modal
        visible={!!selectedTx}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Receipt Header Watermark */}
              <View style={styles.receiptWatermark}>
                <Text style={styles.receiptWatermarkText}>
                  DEMO TRANSACTION – NO REAL MONEY TRANSFERRED
                </Text>
              </View>

              {/* Status Icon */}
              <View style={styles.receiptIconCircle}>
                <MaterialCommunityIcons
                  name={
                    selectedTx?.status === 'SUCCESS'
                      ? 'check-circle'
                      : 'shield-alert'
                  }
                  size={54}
                  color={
                    selectedTx?.status === 'SUCCESS'
                      ? COLORS.safeDark
                      : COLORS.dangerDark
                  }
                />
              </View>

              <Text style={styles.receiptStatusText}>
                {selectedTx?.status === 'SUCCESS'
                  ? 'Simulated Payment Successful'
                  : 'Payment Blocked for Safety'}
              </Text>

              <Text style={styles.receiptAmount}>
                ₹{selectedTx?.amount.toFixed(2)}
              </Text>

              {/* Receipt Details Table */}
              <View style={styles.receiptDetails}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>Receiver</Text>
                  <Text style={styles.receiptRowValue}>{selectedTx?.receiverName}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>UPI ID</Text>
                  <Text style={styles.receiptRowValue}>{selectedTx?.upiId}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>Transaction Ref</Text>
                  <Text style={styles.receiptRowValue}>{selectedTx?.transactionRef}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>Date & Time</Text>
                  <Text style={styles.receiptRowValue}>
                    {selectedTx ? new Date(selectedTx.createdAt).toLocaleString('en-IN') : ''}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>Safety Rating</Text>
                  {selectedTx && <SafetyBadge category={selectedTx.riskCategory} size="small" />}
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeReceiptButton}
                onPress={() => setSelectedTx(null)}
              >
                <Text style={styles.closeReceiptText}>{t('common.close')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  receiptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxHeight: '85%',
  },
  receiptWatermark: {
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  receiptWatermarkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  receiptIconCircle: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  receiptStatusText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  receiptAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.xs,
  },
  receiptDetails: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  receiptRowLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  receiptRowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeReceiptButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  closeReceiptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
