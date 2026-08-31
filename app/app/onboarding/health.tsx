import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { LabeledInput } from '../../src/components/LabeledInput';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { OptionPicker } from '../../src/components/OptionPicker';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const DIET_OPTIONS = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'other', label: 'Other' },
] as const;

export default function HealthScreen() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();

  return (
    <OnboardingScreen
      step={4}
      totalSteps={6}
      title="Injuries and diet"
      subtitle="Your coach will work around these and never suggest something unsafe for you."
      continueDisabled={!draft.dietaryPreference}
      onContinue={() => router.push('/onboarding/body-stats')}
    >
      <LabeledInput
        label="Any injuries or pain to work around?"
        placeholder="e.g. right knee, lower back — leave blank if none"
        value={draft.injuries ?? ''}
        onChangeText={(injuries) => update({ injuries })}
        multiline
      />
      <Text style={{ color: '#9BA895', marginTop: 20, marginBottom: 4, fontSize: 13, fontWeight: '600' }}>
        DIETARY PREFERENCE
      </Text>
      <OptionPicker
        options={DIET_OPTIONS}
        value={draft.dietaryPreference}
        onChange={(dietaryPreference) => update({ dietaryPreference })}
      />
      <LabeledInput
        label="Any food allergies?"
        placeholder="e.g. peanuts, shellfish — leave blank if none"
        value={draft.allergies ?? ''}
        onChangeText={(allergies) => update({ allergies })}
        containerStyle={{ marginTop: 20 }}
      />
    </OnboardingScreen>
  );
}
