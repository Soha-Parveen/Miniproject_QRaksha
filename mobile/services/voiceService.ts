import * as Speech from 'expo-speech';
import { LanguageCode } from '../types';

const LANGUAGE_VOICE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
};

export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
};

export const stopSpeech = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn('[VoiceService] Could not stop speech:', error);
  }
};

export const speakText = async (
  text: string,
  language: LanguageCode = 'en'
): Promise<void> => {
  if (!text || text.trim().length === 0) return;

  try {
    await stopSpeech();

    const voiceCode = LANGUAGE_VOICE_MAP[language] || 'en-IN';

    Speech.speak(text, {
      language: voiceCode,
      pitch: 1.0,
      rate: 0.9, // Slightly slower rate for clear financial pronunciation
      onError: (err) => {
        console.warn(`[VoiceService] Speech error for language ${voiceCode}:`, err);
      },
    });
  } catch (error) {
    console.warn('[VoiceService] Failed to speak text:', error);
  }
};

/**
 * Builds the appropriate auditory transaction readout in the target language.
 */
export const buildTransactionAnnouncement = (
  receiverName: string | undefined,
  amount: number,
  language: LanguageCode
): string => {
  const roundedAmount = Math.round(amount);

  switch (language) {
    case 'hi':
      if (receiverName && receiverName.trim().length > 0) {
        return `आप ${receiverName} को ${roundedAmount} रुपये भेज रहे हैं। कृपया आगे बढ़ने से पहले विवरण सत्यापित करें।`;
      }
      return `आप प्रदर्शित यूपीआई आईडी पर ${roundedAmount} रुपये भेज रहे हैं। कृपया प्राप्तकर्ता को ध्यान से सत्यापित करें।`;

    case 'kn':
      if (receiverName && receiverName.trim().length > 0) {
        return `ನೀವು ${receiverName} ಅವರಿಗೆ ${roundedAmount} ರೂಪಾಯಿಗಳನ್ನು ಕಳುಹಿಸುತ್ತಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ಮುಂದುವರಿಯುವ ಮೊದಲು ವಿವರಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.`;
      }
      return `ನೀವು ಪ್ರದರ್ಶಿಸಲಾದ ಯುಪಿಐ ಐಡಿಗೆ ${roundedAmount} ರೂಪಾಯಿಗಳನ್ನು ಕಳುಹಿಸುತ್ತಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.`;

    case 'ml':
      if (receiverName && receiverName.trim().length > 0) {
        return `നിങ്ങൾ ${receiverName} എന്നയാൾക്ക് ${roundedAmount} രൂപ അയയ്ക്കുകയാണ്. തുടരുന്നതിന് മുൻപ് വിവരങ്ങൾ പരിശോധിക്കുക.`;
      }
      return `നിങ്ങൾ കാണിച്ചിരിക്കുന്ന യുപിഐ ഐഡിയിലേക്ക് ${roundedAmount} രൂപ അയയ്ക്കുകയാണ്. സ്വീകർത്താവിനെ പരിശോധിക്കുക.`;

    case 'en':
    default:
      if (receiverName && receiverName.trim().length > 0) {
        return `You are sending ${roundedAmount} Rupees to ${receiverName}. Please verify the details before continuing.`;
      }
      return `You are sending ${roundedAmount} Rupees to the displayed UPI ID. Please verify the receiver carefully.`;
  }
};
