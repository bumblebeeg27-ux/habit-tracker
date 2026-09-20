import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { clearAllData, updateUserProfile } from '../../src/db/repositories/userProfile';
import { userProfile } from '../../src/db/schema';
import { hasCheckedInToday } from '../../src/db/repositories/attendance';
import { setupNotifications } from '../../src/services/notifications';
import { ThemeMode, useThemeColors } from '../../src/theme/ThemeContext';
import { ThemeColors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = createStyles(colors);
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const profile = profiles?.[0];

  async function handleToggleNotifications(value: boolean) {
    if (!profile) return;
    await updateUserProfile(profile.id, { notificationsEnabled: value });
    const checkedIn = await hasCheckedInToday();
    await setupNotifications({ goal: profile.goal, notificationsEnabled: value }, checkedIn);
  }

  async function handleSetTheme(theme: ThemeMode) {
    if (!profile) return;
    await updateUserProfile(profile.id, { themePreference: theme });
  }

  function handleClearData() {
    Alert.alert(
      'Clear all data?',
      'This deletes your profile, workout history, diet plan, attendance, and coach chat from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear data', style: 'destructive', onPress: () => clearAllData() },
      ],
    );
  }

  if (!profile) return null;

  const theme: ThemeMode = profile.themePreference === 'light' ? 'light' : 'dark';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(profile.name?.[0] ?? '💪').toUpperCase()}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{profile.name || 'Your profile'}</Text>
            <Text style={styles.subtitle}>{profile.goal.replace(/_/g, ' ')} · {profile.experienceLevel}</Text>
          </View>
          <Pressable style={styles.editButton} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        <Section title="Training">
          <Row label="Schedule" value={`${profile.daysPerWeek}x/week, ~${profile.sessionDurationMin} min`} />
          <Row label="Equipment" value={profile.equipmentAccess.replace(/_/g, ' ')} />
        </Section>

        <Section title="Body">
          <Row label="Height" value={`${profile.heightCm} cm`} />
          <Row label="Weight" value={`${profile.weightKg} kg`} />
          <Row label="Activity level" value={profile.activityLevel.replace(/_/g, ' ')} />
        </Section>

        <Section title="Health & diet">
          <Row label="Diet" value={profile.dietaryPreference.replace(/_/g, ' ')} />
          <Row label="Injuries" value={profile.injuries || 'None noted'} />
          <Row label="Allergies" value={profile.allergies || 'None noted'} />
        </Section>

        <Section title="Appearance">
          <View style={styles.themeRow}>
            <Pressable
              style={[styles.themeOption, theme === 'dark' && styles.themeOptionSelected]}
              onPress={() => handleSetTheme('dark')}
            >
              <Text style={[styles.themeOptionText, theme === 'dark' && styles.themeOptionTextSelected]}>
                🌙 Dark
              </Text>
            </Pressable>
            <Pressable
              style={[styles.themeOption, theme === 'light' && styles.themeOptionSelected]}
              onPress={() => handleSetTheme('light')}
            >
              <Text style={[styles.themeOptionText, theme === 'light' && styles.themeOptionTextSelected]}>
                ☀️ Light
              </Text>
            </Pressable>
          </View>
        </Section>

        <Section title="Notifications">
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Daily reminders</Text>
              <Text style={styles.switchHint}>
                A motivational nudge each morning, plus a check-in reminder if you haven't logged in by evening.
              </Text>
            </View>
            <Switch
              value={!!profile.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.accentFill }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </Section>

        <Pressable style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear my data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 24,
      gap: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accentBg,
      borderWidth: 1.5,
      borderColor: colors.accentText,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.accentLight,
      fontSize: 22,
      fontWeight: '700',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      textTransform: 'capitalize',
    },
    editButton: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    editButtonText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '700',
    },
    section: {
      gap: 8,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 12,
      backgroundColor: colors.card,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    rowValue: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'capitalize',
      flexShrink: 1,
      textAlign: 'right',
    },
    themeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    themeOption: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
    },
    themeOptionSelected: {
      borderColor: colors.accentText,
      backgroundColor: colors.accentBg,
    },
    themeOptionText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    themeOptionTextSelected: {
      color: colors.accentText,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    switchText: {
      flex: 1,
      gap: 4,
    },
    switchHint: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    dangerButton: {
      marginTop: 8,
      borderWidth: 1.5,
      borderColor: colors.dangerBorder,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
    },
    dangerButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
