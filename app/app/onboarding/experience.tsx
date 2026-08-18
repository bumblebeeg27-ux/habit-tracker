import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { OptionPicker } from '../../src/components/OptionPicker';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', description: 'New to structured training, or under 6 months in' },
  { value: 'intermediate', label: 'Intermediate', description: '6 months to 2 years of consistent training' },
  { value: 'advanced', label: 'Advanced', description: '2+ years, comfortable programming your own lifts' },
] as const;

const DAYS_OPTIONS = [
  { value: '2', label: '2 days a week' },
  { value: '3', label: '3 days a week' },
  { value: '4', label: '4 days a week' },
  { value: '5', label: '5 days a week' },
  { value: '6', label: '6 days a week' },
] as const;

const DURATION_OPTIONS = [
  { value: '30', label: '~30 min' },
  { value: '45', label: '~45 min' },
  { value: '60', label: '~60 min' },
  { value: '90', label: '90+ min' },
] as const;

export default function ExperienceScreen() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();

  const canContinue = !!draft.experienceLevel && !!draft.daysPerWeek && !!draft.sessionDurationMin;

  return (
    <OnboardingScreen
      step={2}
      totalSteps={6}
      title="Your training experience"
      subtitle="Helps the coach pick the right difficulty and volume."
      continueDisabled={!canContinue}
      onContinue={() => router.push('/onboarding/equipment')}
    >
      <OptionPicker
        options={EXPERIENCE_OPTIONS}
        value={draft.experienceLevel}
        onChange={(experienceLevel) => update({ experienceLevel })}
      />
      <Text style={{ color: '#8A8A8E', marginTop: 20, marginBottom: 4, fontSize: 13, fontWeight: '600' }}>
        HOW OFTEN CAN YOU TRAIN?
      </Text>
      <OptionPicker
        options={DAYS_OPTIONS}
        value={draft.daysPerWeek ? String(draft.daysPerWeek) : undefined}
        onChange={(value) => update({ daysPerWeek: Number(value) })}
      />
      <Text style={{ color: '#8A8A8E', marginTop: 20, marginBottom: 4, fontSize: 13, fontWeight: '600' }}>
        HOW LONG PER SESSION?
      </Text>
      <OptionPicker
        options={DURATION_OPTIONS}
        value={draft.sessionDurationMin ? String(draft.sessionDurationMin) : undefined}
        onChange={(value) => update({ sessionDurationMin: Number(value) })}
      />
    </OnboardingScreen>
  );
}
