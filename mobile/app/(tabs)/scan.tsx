import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadAvailableContacts, UnifiedContact } from '../../services/contactService';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.72;

export default function ScanScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [hasDeviceAccess, setHasDeviceAccess] = useState(false);

  useEffect(() => {
    fetchContacts(false);
  }, []);

  const fetchContacts = async (requestDevice: boolean) => {
    setLoadingContacts(true);
    try {
      const list = await loadAvailableContacts(requestDevice);
      setContacts(list);
      if (requestDevice) setHasDeviceAccess(true);
    } catch (err) {
      console.warn('[ScanScreen] Error loading contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Navigate to transaction review screen with scanned data
    router.push({
      pathname: '/transaction/review',
      params: { qrData: data },
    });

    // Reset lock after delay
    setTimeout(() => setScanned(false), 2000);
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In mobile demo, ask user to select or simulate QR payload from the image
        Alert.alert(
          'Image Selected',
          'Simulate inspection of the selected QR code image:',
          [
            {
              text: 'Safe Merchant QR',
              onPress: () =>
                handleTestPayload(
                  'upi://pay?pa=freshmart@icici&pn=Fresh%20Mart%20Groceries&am=350.00&cu=INR&tn=Vegetables'
                ),
            },
            {
              text: 'Suspicious Phishing QR',
              onPress: () =>
                handleTestPayload(
                  'https://rewards-pay-bonus.top/claim?upi=bonus@lottery'
                ),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (err) {
      console.warn('[Gallery] Picker error:', err);
    }
  };

  const handleTestPayload = (payload: string) => {
    router.push({
      pathname: '/transaction/review',
      params: { qrData: payload },
    });
  };

  const handleSelectContact = (contact: UnifiedContact) => {
    setContactsModalVisible(false);
    const simulatedQr = `upi://pay?pa=${contact.upiId}&pn=${encodeURIComponent(
      contact.name
    )}&am=250.00&cu=INR&tn=Payment%20to%20${encodeURIComponent(contact.name)}`;

    handleTestPayload(simulatedQr);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="camera-off" size={48} color={COLORS.dangerDark} />
        </View>
        <Text style={styles.permTitle}>Camera Permission Required</Text>
        <Text style={styles.permSubtitle}>{t('scanner.permissionDenied')}</Text>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>{t('scanner.grantPermission')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Live Camera Viewfinder */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Viewfinder Target Reticle */}
        <View style={styles.overlay}>
          <View style={styles.reticleContainer}>
            <View style={styles.reticle}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instructionText}>{t('scanner.instruction')}</Text>
          </View>
        </View>

        {/* Flash & Gallery Floating Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={[styles.circleButton, torch && styles.circleButtonActive]}
            onPress={() => setTorch(!torch)}
          >
            <MaterialCommunityIcons
              name={torch ? 'flashlight' : 'flashlight-off'}
              size={22}
              color={torch ? '#FFFFFF' : '#FFFFFF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={handlePickFromGallery}
          >
            <MaterialCommunityIcons name="image" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Testing Tray & Contact Selector */}
      <View style={styles.bottomTray}>
        <View style={styles.trayHeader}>
          <Text style={styles.trayTitle}>Quick Test Scenarios & Contacts</Text>
          <TouchableOpacity onPress={() => setContactsModalVisible(true)}>
            <Text style={styles.pickContactText}>+ Pick Contact</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testButtonsRow}>
          <TouchableOpacity
            style={[styles.testChip, { borderColor: COLORS.safe }]}
            onPress={() =>
              handleTestPayload(
                'upi://pay?pa=ganesh.store@okaxis&pn=Ganesh%20Kirana%20Store&am=200&cu=INR&tn=Groceries'
              )
            }
          >
            <View style={[styles.statusDot, { backgroundColor: COLORS.safe }]} />
            <Text style={styles.testChipText}>Safe Store QR (₹200)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testChip, { borderColor: COLORS.caution }]}
            onPress={() =>
              handleTestPayload('upi://pay?pa=unverified.shop@ybl&cu=INR')
            }
          >
            <View style={[styles.statusDot, { backgroundColor: COLORS.caution }]} />
            <Text style={styles.testChipText}>Missing Name QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testChip, { borderColor: COLORS.caution }]}
            onPress={() =>
              handleTestPayload(
                'upi://pay?pa=luxury.jewels@icici&pn=Heritage%20Jewellers&am=75000&cu=INR&tn=Gold%20Ring'
              )
            }
          >
            <View style={[styles.statusDot, { backgroundColor: COLORS.caution }]} />
            <Text style={styles.testChipText}>High-Value (₹75,000)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testChip, { borderColor: COLORS.danger }]}
            onPress={() =>
              handleTestPayload('https://claim-lottery-cashback.xyz/verify?upi=fake@axis')
            }
          >
            <View style={[styles.statusDot, { backgroundColor: COLORS.danger }]} />
            <Text style={styles.testChipText}>Phishing URL (Blocked)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Contact Selection Modal */}
      <Modal
        visible={contactsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setContactsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Contact</Text>
              <TouchableOpacity onPress={() => setContactsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Contact Search Input */}
            <View style={styles.contactSearchBox}>
              <MaterialCommunityIcons name="magnify" size={18} color={COLORS.textSecondary} />
              <TextInput
                style={styles.contactSearchInput}
                placeholder="Search name or number..."
                placeholderTextColor={COLORS.textMuted}
                value={contactSearch}
                onChangeText={setContactSearch}
              />
              {contactSearch.length > 0 && (
                <TouchableOpacity onPress={() => setContactSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Permission Prompt Banner if Device Contacts not loaded */}
            {!hasDeviceAccess && (
              <TouchableOpacity
                style={styles.deviceAccessBanner}
                onPress={() => fetchContacts(true)}
              >
                <MaterialCommunityIcons name="contacts" size={18} color={COLORS.primary} />
                <Text style={styles.deviceAccessText}>
                  + Load My Phone Contacts (Permission on-demand)
                </Text>
              </TouchableOpacity>
            )}

            {loadingContacts ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView style={styles.contactList}>
                {contacts
                  .filter((c) =>
                    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.phoneNumber.includes(contactSearch)
                  )
                  .map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.contactItem}
                      onPress={() => handleSelectContact(contact)}
                    >
                      <View style={[styles.avatar, { backgroundColor: contact.avatarColor }]}>
                        <Text style={styles.avatarText}>{contact.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.contactInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.contactName}>{contact.name}</Text>
                          <Text style={[styles.sourceBadge, contact.isDeviceContact ? styles.phoneBadge : styles.demoBadge]}>
                            {contact.isDeviceContact ? 'PHONE' : 'DEMO'}
                          </Text>
                        </View>
                        <Text style={styles.contactUpi}>{contact.upiId}</Text>
                        <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  permSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: RADIUS.md,
  },
  permButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleContainer: {
    alignItems: 'center',
  },
  reticle: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#38BDF8',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
  },
  topControls: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  circleButtonActive: {
    backgroundColor: '#F59E0B',
  },
  bottomTray: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  trayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  pickContactText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  testButtonsRow: {
    flexDirection: 'row',
  },
  testChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  testChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  contactSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  deviceAccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: SPACING.sm,
  },
  deviceAccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  sourceBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
    overflow: 'hidden',
  },
  phoneBadge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  demoBadge: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  contactList: {
    marginBottom: SPACING.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactUpi: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  contactPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
