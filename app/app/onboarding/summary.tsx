import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LabeledInput } from '../../src/components/LabeledInput';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { createUserProfile, ProfileDraft } from '../../src/db/repositories/userProfile';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const REQUIRED_FIELDS: (keyof ProfileDraft)[] = [
  'sex',
  'dateOfBirth',
  'heightCm',
  'weightKg',
  'goal',
  'experienceLevel',
  'daysPerWeek',
  'sessionDurationMin',
  'equipmentAccess',
  'activityLevel',
  'dietaryPreference',
];

export default function SummaryScreen() {
  const { draft, update, reset } = useOnboardingStore();
  const [saving, setSaving] = useState(false);

  const isComplete = REQUIRED_FIELDS.every((field) => draft[field] !== undefined && draft[field] !== '');

  async function handleSave() {
    if (!isComplete || saving) return;
    setSaving(true);
    try {
      await createUserProfile(draft as ProfileDraft);
      reset();
      // Stack.Protected in the root layout re-evaluates once the profile
      // row exists and automatically switches from onboarding to tabs.
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScreen
      step={6}
      totalSteps={6}
      title="You're all set"
      subtitle="One last thing before your coach builds your first plan."
      continueDisabled={!isComplete || saving}
      continueLabel={saving ? 'Saving…' : 'Start training'}
      onContinue={handleSave}
    >
      <LabeledInput
        label="What should your coach call you? (optional)"
        placeholder="Your name"
        value={draft.name ?? ''}
        onChangeText={(name) => update({ name })}
      />
      <View style={styles.summaryCard}>
        <SummaryRow label="Goal" value={draft.goal} />
        <SummaryRow label="Experience" value={draft.experienceLevel} />
        <SummaryRow label="Schedule" value={draft.daysPerWeek ? `${draft.daysPerWeek}x/week, ~${draft.sessionDurationMin} min` : undefined} />
        <SummaryRow label="Equipment" value={draft.equipmentAccess} />
        <SummaryRow label="Diet" value={draft.dietaryPreference} />
      </View>
      <Text style={styles.consent}>
        To build your workout and diet plans, your profile (goals, body stats, injuries, and diet
        preferences) is sent to our server and to Anthropic's Claude API for plan generation. It is
        never sold or used for advertising. You can clear all your data anytime from Profile.
      </Text>
    </OnboardingScreen>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.replace(/_/g, ' ') ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderWidth: 1.5,
    borderColor: '#1C2318',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    backgroundColor: '#0A0F0C80',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: '#7C8A78',
    fontSize: 14,
  },
  rowValue: {
    color: '#EAFFEF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  consent: {
    color: '#5C6658',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 20,
  },
});
