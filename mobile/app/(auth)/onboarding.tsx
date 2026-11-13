import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { changeAppLanguage } from '../../locales/i18n';
import { updateLanguage } from '../../database/settingsRepo';
import { LanguageCode } from '../../types';

const { width } = Dimensions.get('window');

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLanguageSelect = (lang: LanguageCode) => {
    changeAppLanguage(lang);
    try {
      updateLanguage(lang);
    } catch {}
  };

  const slides = [
    {
      icon: 'shield-search' as const,
      iconColor: '#3B82F6',
      title: t('onboarding.slide1Title'),
      desc: t('onboarding.slide1Desc'),
    },
    {
      icon: 'account-voice' as const,
      iconColor: '#10B981',
      title: t('onboarding.slide2Title'),
      desc: t('onboarding.slide2Desc'),
    },
    {
      icon: 'wallet-outline' as const,
      iconColor: '#F59E0B',
      title: t('onboarding.slide3Title'),
      desc: t('onboarding.slide3Desc'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selector Header */}
      <View style={styles.langHeader}>
        <Text style={styles.langLabel}>Select Language:</Text>
        <View style={styles.langChips}>
          {LANGUAGES.map((l) => {
            const isSelected = i18n.language === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                style={[styles.langChip, isSelected && styles.langChipActive]}
                onPress={() => handleLanguageSelect(l.code)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langChipText,
                    isSelected && styles.langChipTextActive,
                  ]}
                >
                  {l.native}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Slide Carousel */}
      <View style={styles.carouselContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={slides[activeSlide].icon}
            size={68}
            color={slides[activeSlide].iconColor}
          />
        </View>

        <Text style={styles.slideTitle}>{slides[activeSlide].title}</Text>
        <Text style={styles.slideDesc}>{slides[activeSlide].desc}</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveSlide(idx)}
              style={[
                styles.dot,
                idx === activeSlide ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (activeSlide < slides.length - 1) {
              setActiveSlide(activeSlide + 1);
            } else {
              router.replace('/(auth)/create-pin');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {activeSlide === slides.length - 1
              ? t('onboarding.getStarted')
              : t('common.continue')}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  langHeader: {
    marginTop: SPACING.sm,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  langChips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  langChipTextActive: {
    color: '#FFFFFF',
  },
  carouselContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  slideDesc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.border,
  },
  footer: {
    marginBottom: SPACING.md,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
