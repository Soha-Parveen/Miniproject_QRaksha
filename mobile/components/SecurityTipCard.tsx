import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const SAFETY_TIPS = [
  {
    title: 'Never Scan to Receive Money',
    description: 'QR codes are strictly for SENDING payments. Receiving money never requires scanning a QR code or entering your PIN.',
    icon: 'alert-decagram' as const,
  },
  {
    title: 'Inspect for Physical Overlays',
    description: 'Fraudsters often paste fake QR stickers on top of original shopkeeper stands. Check if the QR code feels raised or replaced.',
    icon: 'sticker-check-outline' as const,
  },
  {
    title: 'Listen to the Voice Readout',
    description: 'QRaksha reads the payee name and amount aloud in your regional language. Confirm both before pressing confirm.',
    icon: 'volume-high' as const,
  },
  {
    title: 'Beware of Web Links in QR Codes',
    description: 'Genuine payment codes start with "upi://pay". Codes that open web browsers or ask to download apps are phishing attacks.',
    icon: 'web-cancel' as const,
  },
];

export const SecurityTipCard: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
  };

  const tip = SAFETY_TIPS[currentTipIndex];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name={tip.icon} size={20} color="#2563EB" />
          <Text style={styles.title}>{tip.title}</Text>
        </View>
        <TouchableOpacity onPress={handleNextTip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="refresh" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{tip.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.counterText}>
          Tip {currentTipIndex + 1} of {SAFETY_TIPS.length}
        </Text>
        <TouchableOpacity onPress={handleNextTip} activeOpacity={0.7}>
          <Text style={styles.nextText}>Next Tip →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EFF6FF', // Light Blue tint
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
    marginVertical: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  counterText: {
    fontSize: 11,
    color: '#60A5FA',
    fontWeight: '600',
  },
  nextText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
});
