import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="experience" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="health" />
      <Stack.Screen name="body-stats" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
