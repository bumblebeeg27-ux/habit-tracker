import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite/query';
import { db } from '../src/db/client';
import { userProfile } from '../src/db/schema';
import migrations from '../drizzle/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Database error: {error.message}</Text>
        </View>
      ) : !success ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Setting up…</Text>
        </View>
      ) : (
        <AppNavigator />
      )}
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const { data: profiles } = useLiveQuery(db.select().from(userProfile));
  const hasProfile = (profiles?.length ?? 0) > 0;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/[sessionId]"
          options={{
            headerShown: true,
            title: 'Workout',
            headerStyle: { backgroundColor: '#05070A' },
            headerTintColor: '#EAFFEF',
          }}
        />
        <Stack.Screen
          name="attendance-calendar"
          options={{
            headerShown: true,
            title: 'Attendance',
            headerStyle: { backgroundColor: '#05070A' },
            headerTintColor: '#EAFFEF',
          }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{
            headerShown: true,
            title: 'Edit profile',
            headerStyle: { backgroundColor: '#05070A' },
            headerTintColor: '#EAFFEF',
          }}
        />
        <Stack.Screen
          name="insights"
          options={{
            headerShown: true,
            title: 'Insights',
            headerStyle: { backgroundColor: '#05070A' },
            headerTintColor: '#EAFFEF',
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070A',
  },
  loadingText: {
    color: '#9BA895',
    fontSize: 15,
  },
  errorText: {
    color: '#F87171',
    fontSize: 15,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
