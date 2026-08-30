import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onContinue,
  continueDisabled,
  continueLabel = 'Continue',
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i < step ? styles.progressDotActive : undefined]}
          />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={[styles.button, continueDisabled ? styles.buttonDisabled : undefined]}
          onPress={onContinue}
          disabled={continueDisabled}
        >
          <Text style={styles.buttonText}>{continueLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1C2318',
  },
  progressDotActive: {
    backgroundColor: '#B6FF3C',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#EAFFEF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#7C8A78',
    marginTop: 8,
    lineHeight: 21,
  },
  body: {
    marginTop: 28,
    gap: 12,
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#B6FF3C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#0A1400',
    fontSize: 17,
    fontWeight: '700',
  },
});
