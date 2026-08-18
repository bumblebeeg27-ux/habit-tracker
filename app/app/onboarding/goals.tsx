import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { OptionPicker } from '../../src/components/OptionPicker';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const GOAL_OPTIONS = [
  { value: 'fat_loss', label: 'Lose fat', description: 'Cut down while keeping the muscle you have' },
  { value: 'muscle_gain', label: 'Build muscle', description: 'Add size and mass' },
  { value: 'strength', label: 'Get stronger', description: 'Push your numbers on the big lifts' },
  { value: 'endurance', label: 'Build endurance', description: 'Improve stamina and conditioning' },
  { value: 'general_fitness', label: 'General fitness', description: "Stay active and feel better overall" },
] as const;

export default function GoalsScreen() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();

  return (
    <OnboardingScreen
      step={1}
      totalSteps={6}
      title="What's your main goal?"
      subtitle="This shapes every workout and meal plan your coach builds for you."
      continueDisabled={!draft.goal}
      onContinue={() => router.push('/onboarding/experience')}
    >
      <OptionPicker
        options={GOAL_OPTIONS}
        value={draft.goal}
        onChange={(goal) => update({ goal })}
      />
    </OnboardingScreen>
  );
}
