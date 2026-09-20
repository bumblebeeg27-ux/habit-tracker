import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { db } from '../src/db/client';
import { userProfile } from '../src/db/schema';
import migrations from '../drizzle/migrations';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {error ? (
          <ErrorState message={error.message} />
        ) : !success ? (
          <LoadingState />
        ) : (
          <AppNavigator />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ErrorState({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <Text style={[styles.errorText, { color: colors.danger }]}>Database error: {message}</Text>
    </View>
  );
}

function LoadingState() {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.bg }]}>
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Setting up…</Text>
    </View>
  );
}

function AppNavigator() {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const { colors, mode } = useTheme();
  const hasProfile = (profiles?.length ?? 0) > 0;

  return (
    <>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={hasProfile}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="workout/[sessionId]"
            options={{
              headerShown: true,
              title: 'Workout',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="attendance-calendar"
            options={{
              headerShown: true,
              title: 'Attendance',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="edit-profile"
            options={{
              headerShown: true,
              title: 'Edit profile',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="insights"
            options={{
              headerShown: true,
              title: 'Insights',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.textPrimary,
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!hasProfile}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
  },
  errorText: {
    fontSize: 15,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
