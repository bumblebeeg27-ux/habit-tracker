import { useRouter } from 'expo-router';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { OptionPicker } from '../../src/components/OptionPicker';
import { useOnboardingStore } from '../../src/state/onboardingStore';

const EQUIPMENT_OPTIONS = [
  { value: 'full_gym', label: 'Full gym', description: 'Barbells, machines, cables, the works' },
  { value: 'home_dumbbells', label: 'Home dumbbells', description: 'A set of dumbbells and maybe a bench' },
  { value: 'bodyweight_only', label: 'Bodyweight only', description: 'No equipment at all' },
  { value: 'bands', label: 'Resistance bands', description: 'Bands, maybe light dumbbells' },
] as const;

export default function EquipmentScreen() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();

  return (
    <OnboardingScreen
      step={3}
      totalSteps={6}
      title="What do you have to train with?"
      subtitle="Your coach only ever programs exercises you can actually do."
      continueDisabled={!draft.equipmentAccess}
      onContinue={() => router.push('/onboarding/health')}
    >
      <OptionPicker
        options={EQUIPMENT_OPTIONS}
        value={draft.equipmentAccess}
        onChange={(equipmentAccess) => update({ equipmentAccess })}
      />
    </OnboardingScreen>
  );
}
