export type LanguageCode = 'en' | 'hi' | 'kn' | 'ml';

export interface AppSettings {
  language: LanguageCode;
  voiceEnabled: boolean;
  biometricEnabled: boolean;
  highValueThreshold: number;
}
