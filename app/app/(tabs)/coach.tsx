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

export default function CoachScreen() {
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
              <Text style={styles.bubbleText}>{m.content}</Text>
            </View>
          ))}
          {sending && (
            <View style={[styles.bubble, styles.modelBubble]}>
              <ActivityIndicator color="#9BA895" />
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask your coach…"
            placeholderTextColor="#7C8A78"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#EAFFEF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#7C8A78',
    marginTop: 4,
  },
  messages: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#9BA895',
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
    backgroundColor: '#B6FF3C',
  },
  modelBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0A0F0C80',
    borderWidth: 1.5,
    borderColor: '#1C2318',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#EAFFEF',
  },
  errorText: {
    color: '#F87171',
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
    borderTopColor: '#1C2318',
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#EAFFEF',
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: '#0A0F0C80',
  },
  sendButton: {
    backgroundColor: '#B6FF3C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#0A1400',
    fontSize: 14,
    fontWeight: '700',
  },
});
