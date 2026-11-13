import { getDatabase } from './db';
import { AppSettings, LanguageCode } from '../types';

interface RawSettingsRow {
  id: number;
  language: string;
  voice_enabled: number;
  biometric_enabled: number;
  high_value_threshold: number;
}

export const getSettings = (): AppSettings => {
  const db = getDatabase();
  const row = db.getFirstSync<RawSettingsRow>('SELECT * FROM settings WHERE id = 1');
  if (!row) {
    return {
      language: 'en',
      voiceEnabled: true,
      biometricEnabled: false,
      highValueThreshold: 50000.00,
    };
  }

  return {
    language: row.language as LanguageCode,
    voiceEnabled: row.voice_enabled === 1,
    biometricEnabled: row.biometric_enabled === 1,
    highValueThreshold: row.high_value_threshold,
  };
};

export const updateLanguage = (lang: LanguageCode): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE settings SET language = ?, updated_at = datetime("now") WHERE id = 1',
    [lang]
  );
};

export const updateVoiceEnabled = (enabled: boolean): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE settings SET voice_enabled = ?, updated_at = datetime("now") WHERE id = 1',
    [enabled ? 1 : 0]
  );
};

export const updateBiometricEnabled = (enabled: boolean): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE settings SET biometric_enabled = ?, updated_at = datetime("now") WHERE id = 1',
    [enabled ? 1 : 0]
  );
};

export const updateHighValueThreshold = (threshold: number): void => {
  const db = getDatabase();
  db.runSync(
    'UPDATE settings SET high_value_threshold = ?, updated_at = datetime("now") WHERE id = 1',
    [threshold]
  );
};
