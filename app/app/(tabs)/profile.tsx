import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { clearUserProfile } from '../../src/db/repositories/userProfile';
import { userProfile } from '../../src/db/schema';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const profile = profiles?.[0];

  function handleClearData() {
    Alert.alert(
      'Clear all data?',
      'This deletes your profile from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear data', style: 'destructive', onPress: () => clearUserProfile() },
      ],
    );
  }

  if (!profile) return null;

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

        <Pressable style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear my data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F0D',
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
    backgroundColor: '#16321F',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4ADE80',
    fontSize: 22,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  editButton: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: '#8A8A8E',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1.5,
    borderColor: '#1F2A24',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    backgroundColor: '#12181580',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: {
    color: '#8A8A8E',
    fontSize: 14,
  },
  rowValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    flexShrink: 1,
    textAlign: 'right',
  },
  dangerButton: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#7F1D1D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '600',
  },
});
