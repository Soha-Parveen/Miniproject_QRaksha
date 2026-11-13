import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RiskCategory } from '../types';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface SafetyBadgeProps {
  category: RiskCategory;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({
  category,
  size = 'medium',
  showLabel = true,
}) => {
  const getBadgeConfig = () => {
    switch (category) {
      case 'GREEN':
        return {
          label: 'SAFE',
          icon: 'shield-check' as const,
          bg: COLORS.safeLight,
          border: COLORS.safeBorder,
          text: COLORS.safeDark,
        };
      case 'YELLOW':
        return {
          label: 'CAUTION',
          icon: 'shield-alert' as const,
          bg: COLORS.cautionLight,
          border: COLORS.cautionBorder,
          text: COLORS.cautionDark,
        };
      case 'RED':
      default:
        return {
          label: 'HIGH RISK',
          icon: 'shield-remove' as const,
          bg: COLORS.dangerLight,
          border: COLORS.dangerBorder,
          text: COLORS.dangerDark,
        };
    }
  };

  const config = getBadgeConfig();
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 18 : 26;
  const fontSize = size === 'small' ? 11 : size === 'medium' ? 13 : 16;
  const paddingVertical = size === 'small' ? 2 : size === 'medium' ? 6 : 10;
  const paddingHorizontal = size === 'small' ? 8 : size === 'medium' ? 12 : 16;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={iconSize}
        color={config.text}
        style={styles.icon}
      />
      {showLabel && (
        <Text style={[styles.label, { color: config.text, fontSize }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
