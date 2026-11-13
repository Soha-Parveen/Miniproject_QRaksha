import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentTransaction } from '../types';
import { SafetyBadge } from './SafetyBadge';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface TransactionCardProps {
  transaction: PaymentTransaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const isSuccess = transaction.status === 'SUCCESS';
  const isBlocked = transaction.status === 'BLOCKED';

  const dateObj = new Date(transaction.createdAt);
  const formattedDate = dateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.sm]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSuccess
                ? COLORS.safeLight
                : isBlocked
                ? COLORS.dangerLight
                : COLORS.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              isSuccess
                ? 'arrow-up-bold-circle'
                : isBlocked
                ? 'shield-alert'
                : 'close-circle'
            }
            size={24}
            color={isSuccess ? COLORS.safeDark : COLORS.dangerDark}
          />
        </View>

        <View style={styles.details}>
          <Text style={styles.receiverName} numberOfLines={1}>
            {transaction.receiverName || 'Unknown Merchant'}
          </Text>
          <Text style={styles.upiId} numberOfLines={1}>
            {transaction.upiId}
          </Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amount,
            { color: isSuccess ? COLORS.textPrimary : COLORS.dangerDark },
          ]}
        >
          {isBlocked ? 'BLOCKED' : `₹${transaction.amount.toFixed(2)}`}
        </Text>
        <View style={styles.badgeWrapper}>
          <SafetyBadge category={transaction.riskCategory} size="small" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
  },
  receiverName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  upiId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  badgeWrapper: {
    marginTop: 2,
  },
});
