import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { chatMessage as chatMessageTable, userProfile } from '../../src/db/schema';
import { addChatMessage, getChatHistory } from '../../src/db/repositories/chatMessage';
import { sendChatMessage } from '../../src/services/api';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';

export default function CoachScreen() {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { data: messages } = useLiveQuery(db.select().from(chatMessageTable));
  const profile = profiles?.[0];

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || !profile || sending) return;
    setInput('');
    setError(null);
    setSending(true);
    try {
      await addChatMessage('user', text);
      const history = await getChatHistory();
      const recentHistory = history
        .slice(-20)
        .map((m) => ({ role: m.role, text: m.content }));
      const reply = await sendChatMessage(profile, text, recentHistory.slice(0, -1));
      await addChatMessage('model', reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Coach</Text>
          <Text style={styles.disclaimer}>
            Not a substitute for medical advice. For pain or injury, see a doctor or physio.
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {(!messages || messages.length === 0) && (
            <Text style={styles.emptyText}>
              Ask about training, form, recovery, or nutrition -- your coach knows your profile.
            </Text>
          )}
          {messages?.map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.modelBubble]}
            >
              <Text style={m.role === 'user' ? styles.userBubbleText : styles.modelBubbleText}>{m.content}</Text>
            </View>
          ))}
          {sending && (
            <View style={[styles.bubble, styles.modelBubble]}>
              <ActivityIndicator color={colors.textSecondary} />
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask your coach…"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    disclaimer: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
    messages: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      gap: 10,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginTop: 24,
    },
    bubble: {
      maxWidth: '85%',
      borderRadius: 14,
      padding: 12,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.accentFill,
    },
    modelBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    userBubbleText: {
      fontSize: 15,
      lineHeight: 21,
      color: colors.onAccent,
    },
    modelBubbleText: {
      fontSize: 15,
      lineHeight: 21,
      color: colors.textPrimary,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 4,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colors.textPrimary,
      fontSize: 15,
      maxHeight: 100,
      backgroundColor: colors.card,
    },
    sendButton: {
      backgroundColor: colors.accentFill,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    sendButtonText: {
      color: colors.onAccent,
      fontSize: 14,
      fontWeight: '700',
    },
  });
}
