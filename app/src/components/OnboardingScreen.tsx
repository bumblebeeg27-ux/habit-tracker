import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme/ThemeContext';
import { ThemeColors } from '../theme/colors';

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
  const colors = useThemeColors();
  const styles = createStyles(colors);
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
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
      backgroundColor: colors.border,
    },
    progressDotActive: {
      backgroundColor: colors.accentFill,
    },
    content: {
      padding: 24,
      paddingBottom: 40,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
      marginTop: 12,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
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
      backgroundColor: colors.accentFill,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: colors.onAccent,
      fontSize: 17,
      fontWeight: '700',
    },
  });
}
