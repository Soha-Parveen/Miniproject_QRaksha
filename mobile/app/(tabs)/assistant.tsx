import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function AssistantScreen() {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: t('assistant.welcome'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');

  const quickQuestions = [
    { q: t('assistant.q1'), a: t('assistant.a1') },
    { q: t('assistant.q2'), a: t('assistant.a2') },
    { q: t('assistant.q3'), a: t('assistant.a3') },
    { q: t('assistant.q4'), a: t('assistant.a4') },
    { q: t('assistant.q5'), a: t('assistant.a5') },
  ];

  const handleSelectQuickQuestion = (q: string, a: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: time,
    };

    const botMsg: ChatMessage = {
      id: 'bot_' + (Date.now() + 1),
      sender: 'bot',
      text: a,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSendCustomQuery = () => {
    if (!inputQuery.trim()) return;

    const query = inputQuery.trim();
    setInputQuery('');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: time,
    };

    // Rule-based keyword matching for offline assistant
    const lower = query.toLowerCase();
    let reply = t('assistant.welcome');

    if (lower.includes('fraud') || lower.includes('detect') || lower.includes('work') || lower.includes('धोखाधड़ी') || lower.includes('ವಂಚನೆ')) {
      reply = t('assistant.a1');
    } else if (lower.includes('green') || lower.includes('safe') || lower.includes('हरा') || lower.includes('ಹಸಿರು') || lower.includes('പച്ച')) {
      reply = t('assistant.a2');
    } else if (lower.includes('red') || lower.includes('danger') || lower.includes('लाल') || lower.includes('ಕೆಂಪು') || lower.includes('ചുവപ്പ്')) {
      reply = t('assistant.a3');
    } else if (lower.includes('steal') || lower.includes('receive') || lower.includes('पैसा') || lower.includes('ಹಣ') || lower.includes('പണം')) {
      reply = t('assistant.a4');
    } else if (lower.includes('real') || lower.includes('dummy') || lower.includes('wallet') || lower.includes('असली') || lower.includes('ನೈಜ')) {
      reply = t('assistant.a5');
    } else {
      reply =
        'QRaksha analyzes UPI payment parameters to safeguard you against fake QR stickers, suspicious links, and unexpected amounts. Please choose one of the common security topics above.';
    }

    const botMsg: ChatMessage = {
      id: 'bot_' + (Date.now() + 1),
      sender: 'bot',
      text: reply,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.botAvatar}>
          <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>{t('assistant.title')}</Text>
          <Text style={styles.headerSubtitle}>Offline Knowledge Engine Active</Text>
        </View>
      </View>

      {/* Quick Question Chips */}
      <View style={styles.quickQuestionsSection}>
        <Text style={styles.quickSectionLabel}>{t('assistant.quickQuestions')}:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {quickQuestions.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.questionChip}
              onPress={() => handleSelectQuickQuestion(item.q, item.a)}
            >
              <MaterialCommunityIcons name="help-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.chipText}>{item.q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Messages Stream */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.messageBubbleWrapper,
                isUser ? styles.userWrapper : styles.botWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.botBubble,
                  SHADOWS.sm,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.botText,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.timestamp,
                    isUser ? styles.userTimestamp : styles.botTimestamp,
                  ]}
                >
                  {m.timestamp}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question about QR safety..."
          placeholderTextColor={COLORS.textMuted}
          value={inputQuery}
          onChangeText={setInputQuery}
          onSubmitEditing={handleSendCustomQuery}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputQuery.trim() && styles.sendButtonDisabled]}
          onPress={handleSendCustomQuery}
          disabled={!inputQuery.trim()}
        >
          <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.safeDark,
    fontWeight: '600',
  },
  quickQuestionsSection: {
    paddingVertical: SPACING.sm,
    backgroundColor: '#F1F5F9',
  },
  quickSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.lg,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  chipsScroll: {
    paddingHorizontal: SPACING.lg,
  },
  questionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  messageBubbleWrapper: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  botWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#93C5FD',
  },
  botTimestamp: {
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    height: 46,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
});
