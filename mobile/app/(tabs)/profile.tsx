import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getSettings,
  updateLanguage,
  updateVoiceEnabled,
  updateBiometricEnabled,
  updateHighValueThreshold,
} from '../../database/settingsRepo';
import { resetWalletAndHistory } from '../../database/walletRepo';
import { changeAppLanguage } from '../../locales/i18n';
import { LanguageCode } from '../../types';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [threshold, setThreshold] = useState(50000);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [thresholdModalVisible, setThresholdModalVisible] = useState(false);
  const [newThresholdInput, setNewThresholdInput] = useState('50000');
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  useEffect(() => {
    try {
      const settings = getSettings();
      setVoiceEnabled(settings.voiceEnabled);
      setBiometricEnabled(settings.biometricEnabled);
      setThreshold(settings.highValueThreshold);
      setNewThresholdInput(settings.highValueThreshold.toString());
    } catch (err) {
      console.warn('[Profile] Load error:', err);
    }
  }, []);

  const handleToggleVoice = (value: boolean) => {
    setVoiceEnabled(value);
    updateVoiceEnabled(value);
  };

  const handleToggleBiometric = (value: boolean) => {
    setBiometricEnabled(value);
    updateBiometricEnabled(value);
  };

  const handleSelectLanguage = (code: LanguageCode) => {
    changeAppLanguage(code);
    updateLanguage(code);
    setLangModalVisible(false);
  };

  const handleSaveThreshold = () => {
    const val = parseFloat(newThresholdInput);
    if (isNaN(val) || val < 1000) {
      Alert.alert(t('common.error'), 'Minimum threshold must be at least ₹1,000');
      return;
    }
    setThreshold(val);
    updateHighValueThreshold(val);
    setThresholdModalVisible(false);
  };

  const handleResetData = () => {
    Alert.alert(
      t('profile.resetData'),
      t('profile.resetConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetWalletAndHistory();
            Alert.alert(t('common.success'), 'Demo wallet balance restored to ₹10,000.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.profileCard, SHADOWS.sm]}>
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="shield-account" size={40} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>QRaksha Safety User</Text>
            <Text style={styles.userRole}>Smart Payment Protector</Text>
            <View style={styles.demoPill}>
              <Text style={styles.demoPillText}>SIMULATED ENVIRONMENT</Text>
            </View>
          </View>
        </View>

        {/* General Settings Section */}
        <Text style={styles.sectionHeader}>Preferences & Accessibility</Text>

        {/* Language Selection */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setLangModalVisible(true)}
        >
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="translate" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>{t('profile.language')}</Text>
            <Text style={styles.settingDesc}>
              {LANGUAGES.find((l) => l.code === i18n.language)?.native || 'English'}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Voice Assistance Switch */}
        <View style={styles.settingRow}>
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="account-voice" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>{t('profile.voiceAssistance')}</Text>
            <Text style={styles.settingDesc}>{t('profile.voiceAssistanceDesc')}</Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={handleToggleVoice}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security Controls</Text>

        {/* Biometrics Switch */}
        <View style={styles.settingRow}>
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="fingerprint" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>{t('profile.biometrics')}</Text>
            <Text style={styles.settingDesc}>{t('profile.biometricsDesc')}</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
          />
        </View>

        {/* High-Value Threshold */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setThresholdModalVisible(true)}
        >
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="cash-multiple" size={22} color={COLORS.cautionDark} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>{t('profile.highValueThreshold')}</Text>
            <Text style={styles.settingDesc}>
              Alerts for payments over ₹{threshold.toLocaleString('en-IN')}
            </Text>
          </View>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* App Info & Reset */}
        <Text style={styles.sectionHeader}>Application Maintenance</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setAboutModalVisible(true)}
        >
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="information-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingTitle}>{t('profile.about')}</Text>
            <Text style={styles.settingDesc}>{t('profile.aboutDesc')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleResetData}>
          <View style={styles.settingIconCol}>
            <MaterialCommunityIcons name="restore" size={22} color={COLORS.dangerDark} />
          </View>
          <View style={styles.settingTextCol}>
            <Text style={[styles.settingTitle, { color: COLORS.dangerDark }]}>
              {t('profile.resetData')}
            </Text>
            <Text style={styles.settingDesc}>Reset dummy wallet balance to ₹10,000</Text>
          </View>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.dangerDark} />
          <Text style={styles.logoutButtonText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Language</Text>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={styles.langOption}
                onPress={() => handleSelectLanguage(l.code)}
              >
                <Text style={styles.langOptionNative}>{l.native}</Text>
                <Text style={styles.langOptionLabel}>({l.label})</Text>
                {i18n.language === l.code && (
                  <MaterialCommunityIcons name="check" size={22} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* High-Value Threshold Modal */}
      <Modal
        visible={thresholdModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setThresholdModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set High-Value Threshold</Text>
            <Text style={styles.modalSubtitle}>
              Payments exceeding this amount will require explicit warning acknowledgement.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newThresholdInput}
              onChangeText={setNewThresholdInput}
              keyboardType="numeric"
              placeholder="50000"
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setThresholdModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveThreshold}>
                <Text style={styles.modalSaveText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About QRaksha Modal */}
      <Modal
        visible={aboutModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.aboutHeader}>
              <MaterialCommunityIcons name="shield-check" size={44} color={COLORS.primary} />
              <Text style={styles.aboutTitle}>QRaksha</Text>
              <Text style={styles.aboutTagline}>Scan Smart. Pay Safe.</Text>
            </View>
            <ScrollView style={{ maxHeight: 240, marginVertical: SPACING.md }}>
              <Text style={styles.aboutText}>
                QRaksha is an educational Android mobile application developed as a Computer Science & Engineering mini-project by Soha Parveen.
              </Text>
              <Text style={styles.aboutText}>
                It evaluates UPI payment QR codes using a multi-rule heuristic engine, identifies tampered parameters, announces transaction details in regional languages, and simulates safe payment processing.
              </Text>
              <Text style={[styles.aboutText, { fontWeight: '700', color: COLORS.dangerDark }]}>
                Disclaimer: All payments are completely simulated. No real money or banking credentials are ever used.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAboutModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  demoPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  demoPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  settingIconCol: {
    width: 36,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  logoutButtonText: {
    color: COLORS.dangerDark,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: SPACING.sm,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  modalSave: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  langOptionNative: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  langOptionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  modalCloseButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  modalCloseText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 4,
  },
  aboutTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  aboutText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
});
