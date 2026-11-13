import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

interface PinInputProps {
  pin: string;
  onPinChange: (newPin: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  pin,
  onPinChange,
  maxLength = 4,
  disabled = false,
}) => {
  const handlePressNumber = (num: string) => {
    if (disabled || pin.length >= maxLength) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPinChange(pin + num);
  };

  const handleBackspace = () => {
    if (disabled || pin.length === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPinChange(pin.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || pin.length === 0) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    onPinChange('');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      {/* 4-Digit Indicator Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: maxLength }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isFilled ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          );
        })}
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((item) => {
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key="backspace"
                    style={[styles.keyButton, styles.specialKey]}
                    onPress={handleBackspace}
                    disabled={disabled || pin.length === 0}
                    activeOpacity={0.6}
                  >
                    <MaterialCommunityIcons
                      name="backspace-outline"
                      size={24}
                      color={COLORS.textPrimary}
                    />
                  </TouchableOpacity>
                );
              }

              if (item === 'clear') {
                return (
                  <TouchableOpacity
                    key="clear"
                    style={[styles.keyButton, styles.specialKey]}
                    onPress={handleClear}
                    disabled={disabled || pin.length === 0}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.clearText}>CLR</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={item}
                  style={styles.keyButton}
                  onPress={() => handlePressNumber(item)}
                  disabled={disabled || pin.length >= maxLength}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: RADIUS.full,
    marginHorizontal: 10,
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    marginTop: SPACING.md,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  specialKey: {
    backgroundColor: COLORS.background,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});
