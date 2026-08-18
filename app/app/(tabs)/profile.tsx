import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../src/db/client';
import { clearUserProfile } from '../../src/db/repositories/userProfile';
import { userProfile } from '../../src/db/schema';

export default function ProfileScreen() {
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        {profile ? (
          <View style={styles.card}>
            <Row label="Name" value={profile.name ?? '—'} />
            <Row label="Goal" value={profile.goal.replace(/_/g, ' ')} />
            <Row label="Experience" value={profile.experienceLevel} />
            <Row label="Schedule" value={`${profile.daysPerWeek}x/week, ~${profile.sessionDurationMin} min`} />
            <Row label="Equipment" value={profile.equipmentAccess.replace(/_/g, ' ')} />
            <Row label="Height" value={`${profile.heightCm} cm`} />
            <Row label="Weight" value={`${profile.weightKg} kg`} />
            <Row label="Activity level" value={profile.activityLevel.replace(/_/g, ' ')} />
            <Row label="Diet" value={profile.dietaryPreference.replace(/_/g, ' ')} />
            {profile.injuries ? <Row label="Injuries" value={profile.injuries} /> : null}
            {profile.allergies ? <Row label="Allergies" value={profile.allergies} /> : null}
          </View>
        ) : null}
        <Pressable style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>Clear my data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
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
    marginTop: 32,
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
