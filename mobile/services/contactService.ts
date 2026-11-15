import * as Contacts from 'expo-contacts';
import { DemoContact } from '../types';
import { getDemoContacts } from '../database/contactRepo';

export interface UnifiedContact {
  id: string;
  name: string;
  phoneNumber: string;
  upiId: string;
  avatarColor: string;
  isDeviceContact: boolean;
}

const AVATAR_COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

/**
 * Loads contacts on-demand:
 * 1. Predefined demo contacts from local SQLite database
 * 2. Device contacts (if user grants on-demand permission)
 * Note: Never uploads contacts to any remote server (Section 11 Privacy Guarantee).
 */
export const loadAvailableContacts = async (
  requestDeviceAccess: boolean = false
): Promise<UnifiedContact[]> => {
  const result: UnifiedContact[] = [];

  // 1. Load pre-seeded demo contacts
  try {
    const demo = getDemoContacts();
    for (const d of demo) {
      result.push({
        id: `demo_${d.id}`,
        name: d.name,
        phoneNumber: d.phoneNumber,
        upiId: d.demoUpiId,
        avatarColor: d.avatarColor || '#1E3A8A',
        isDeviceContact: false,
      });
    }
  } catch (err) {
    console.warn('[ContactService] Error reading demo contacts:', err);
  }

  // 2. Load device contacts if requested and permitted
  if (requestDeviceAccess) {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
          pageSize: 20,
        });

        if (data && data.length > 0) {
          data.forEach((c, idx) => {
            const rawPhone = c.phoneNumbers && c.phoneNumbers[0]?.number;
            if (c.name && rawPhone) {
              const cleanDigits = rawPhone.replace(/\D/g, '').slice(-10);
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              // Explicit demo UPI ID mapping (Never assumes phone number is real UPI ID)
              const safeHandle = c.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
              const demoMappedUpi = `${safeHandle || 'user'}@demo.upi`;

              result.push({
                id: `dev_${c.id || idx}`,
                name: c.name,
                phoneNumber: cleanDigits || rawPhone,
                upiId: demoMappedUpi,
                avatarColor: color,
                isDeviceContact: true,
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('[ContactService] Device contacts permission/load error:', err);
    }
  }

  return result;
};

