import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { LabeledInput } from '../../src/components/LabeledInput';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { OptionPicker } from '../../src/components/OptionPicker';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Desk job, little movement day to day' },
  { value: 'lightly_active', label: 'Lightly active', description: 'Some walking, light activity most days' },
  { value: 'moderately_active', label: 'Moderately active', description: 'On your feet a lot, active job or lifestyle' },
  { value: 'very_active', label: 'Very active', description: 'Physically demanding job or daily hard training' },
] as const;

function ageToDateOfBirth(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
}

export default function BodyStatsScreen() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();
  const [age, setAge] = useState('');

  const canContinue = !!draft.sex && !!age && !!draft.heightCm && !!draft.weightKg && !!draft.activityLevel;

  return (
    <OnboardingScreen
      step={5}
      totalSteps={6}
      title="A few body stats"
      subtitle="Used to calculate your calorie and macro targets — never shared beyond generating your plan."
      continueDisabled={!canContinue}
      onContinue={() => router.push('/onboarding/summary')}
    >
      <OptionPicker options={SEX_OPTIONS} value={draft.sex} onChange={(sex) => update({ sex })} />
      <LabeledInput
        label="Age"
        placeholder="e.g. 29"
        keyboardType="number-pad"
        value={age}
        onChangeText={(text) => {
          setAge(text);
          const parsed = Number(text);
          if (parsed > 0) update({ dateOfBirth: ageToDateOfBirth(parsed) });
        }}
        containerStyle={{ marginTop: 20 }}
      />
      <LabeledInput
        label="Height (cm)"
        placeholder="e.g. 175"
        keyboardType="decimal-pad"
        value={draft.heightCm ? String(draft.heightCm) : ''}
        onChangeText={(text) => update({ heightCm: Number(text) || undefined })}
        containerStyle={{ marginTop: 16 }}
      />
      <LabeledInput
        label="Weight (kg)"
        placeholder="e.g. 72"
        keyboardType="decimal-pad"
        value={draft.weightKg ? String(draft.weightKg) : ''}
        onChangeText={(text) => update({ weightKg: Number(text) || undefined })}
        containerStyle={{ marginTop: 16 }}
      />
      <Text style={{ color: '#7C8A78', marginTop: 20, marginBottom: 4, fontSize: 13, fontWeight: '600' }}>
        DAILY ACTIVITY LEVEL
      </Text>
      <OptionPicker
        options={ACTIVITY_OPTIONS}
        value={draft.activityLevel}
        onChange={(activityLevel) => update({ activityLevel })}
      />
    </OnboardingScreen>
  );
}
