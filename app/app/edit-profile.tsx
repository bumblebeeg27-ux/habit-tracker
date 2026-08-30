import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LabeledInput } from '../src/components/LabeledInput';
import { OptionPicker } from '../src/components/OptionPicker';
import { db } from '../src/db/client';
import { updateUserProfile, ProfileDraft } from '../src/db/repositories/userProfile';
import { userProfile } from '../src/db/schema';

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Lose fat' },
  { value: 'muscle_gain', label: 'Build muscle' },
  { value: 'strength', label: 'Get stronger' },
  { value: 'endurance', label: 'Build endurance' },
  { value: 'general_fitness', label: 'General fitness' },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const EQUIPMENT_OPTIONS = [
  { value: 'full_gym', label: 'Full gym' },
  { value: 'home_dumbbells', label: 'Home dumbbells' },
  { value: 'bodyweight_only', label: 'Bodyweight only' },
  { value: 'bands', label: 'Resistance bands' },
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly active' },
  { value: 'moderately_active', label: 'Moderately active' },
  { value: 'very_active', label: 'Very active' },
] as const;

const DIET_OPTIONS = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'other', label: 'Other' },
] as const;

const DAYS_OPTIONS = ['2', '3', '4', '5', '6'] as const;
const DURATION_OPTIONS = ['30', '45', '60', '90'] as const;

function ageFromDateOfBirth(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const diffMs = Date.now() - dob.getTime();
  return Math.max(1, Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
}

function ageToDateOfBirth(age: number): string {
  return `${new Date().getFullYear() - age}-01-01`;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const profile = profiles?.[0];

  const [draft, setDraft] = useState<Partial<ProfileDraft>>({});
  const [age, setAge] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && draft.goal === undefined) {
      const { id, createdAt, updatedAt, ...rest } = profile;
      setDraft(rest);
      setAge(String(ageFromDateOfBirth(profile.dateOfBirth)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  function patch(fields: Partial<ProfileDraft>) {
    setDraft((d) => ({ ...d, ...fields }));
  }

  async function handleSave() {
    if (!profile || saving) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.id, draft);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (!profile || draft.goal === undefined) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Basics">
          <LabeledInput label="Name" value={draft.name ?? ''} onChangeText={(name) => patch({ name })} />
        </Section>

        <Section title="Goal">
          <OptionPicker options={GOAL_OPTIONS} value={draft.goal} onChange={(goal) => patch({ goal })} />
        </Section>

        <Section title="Experience">
          <OptionPicker
            options={EXPERIENCE_OPTIONS}
            value={draft.experienceLevel}
            onChange={(experienceLevel) => patch({ experienceLevel })}
          />
        </Section>

        <Section title="Training schedule">
          <Text style={styles.subLabel}>DAYS PER WEEK</Text>
          <OptionPicker
            options={DAYS_OPTIONS.map((d) => ({ value: d, label: `${d} days` }))}
            value={draft.daysPerWeek ? String(draft.daysPerWeek) : undefined}
            onChange={(v) => patch({ daysPerWeek: Number(v) })}
          />
          <Text style={[styles.subLabel, { marginTop: 16 }]}>SESSION LENGTH</Text>
          <OptionPicker
            options={DURATION_OPTIONS.map((d) => ({ value: d, label: `~${d} min` }))}
            value={draft.sessionDurationMin ? String(draft.sessionDurationMin) : undefined}
            onChange={(v) => patch({ sessionDurationMin: Number(v) })}
          />
        </Section>

        <Section title="Equipment">
          <OptionPicker
            options={EQUIPMENT_OPTIONS}
            value={draft.equipmentAccess}
            onChange={(equipmentAccess) => patch({ equipmentAccess })}
          />
        </Section>

        <Section title="Body stats">
          <LabeledInput
            label="Age"
            keyboardType="number-pad"
            value={age}
            onChangeText={(text) => {
              setAge(text);
              const parsed = Number(text);
              if (parsed > 0) patch({ dateOfBirth: ageToDateOfBirth(parsed) });
            }}
          />
          <LabeledInput
            label="Height (cm)"
            keyboardType="decimal-pad"
            value={draft.heightCm ? String(draft.heightCm) : ''}
            onChangeText={(text) => patch({ heightCm: Number(text) || undefined })}
            containerStyle={{ marginTop: 16 }}
          />
          <LabeledInput
            label="Weight (kg)"
            keyboardType="decimal-pad"
            value={draft.weightKg ? String(draft.weightKg) : ''}
            onChangeText={(text) => patch({ weightKg: Number(text) || undefined })}
            containerStyle={{ marginTop: 16 }}
          />
          <Text style={[styles.subLabel, { marginTop: 16 }]}>ACTIVITY LEVEL</Text>
          <OptionPicker
            options={ACTIVITY_OPTIONS}
            value={draft.activityLevel}
            onChange={(activityLevel) => patch({ activityLevel })}
          />
        </Section>

        <Section title="Health & diet">
          <LabeledInput
            label="Injuries or pain to work around"
            value={draft.injuries ?? ''}
            onChangeText={(injuries) => patch({ injuries })}
            multiline
          />
          <Text style={[styles.subLabel, { marginTop: 16 }]}>DIETARY PREFERENCE</Text>
          <OptionPicker
            options={DIET_OPTIONS}
            value={draft.dietaryPreference}
            onChange={(dietaryPreference) => patch({ dietaryPreference })}
          />
          <LabeledInput
            label="Food allergies"
            value={draft.allergies ?? ''}
            onChangeText={(allergies) => patch({ allergies })}
            containerStyle={{ marginTop: 16 }}
          />
        </Section>

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save changes'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070A',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#EAFFEF',
    fontSize: 17,
    fontWeight: '700',
  },
  subLabel: {
    color: '#7C8A78',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#B6FF3C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#0A1400',
    fontSize: 17,
    fontWeight: '700',
  },
});
