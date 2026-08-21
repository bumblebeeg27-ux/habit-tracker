import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WORKOUT_REMINDER_ID = 'daily-workout-reminder';
const STREAK_RISK_ID = 'streak-risk-nudge';

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDailyWorkoutReminder(hour = 8, minute = 0): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WORKOUT_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: WORKOUT_REMINDER_ID,
    content: {
      title: 'Time to train',
      body: "Today's workout is ready when you are.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Streak-risk nudge is a one-time (not repeating) notification, rescheduled
 * every time attendance state changes: if they've already checked in today
 * it moves to tomorrow evening, otherwise it stays at tonight's reminder
 * time (or tomorrow, if that time has already passed today).
 */
export async function rescheduleStreakRiskNudge(hasCheckedInToday: boolean, hour = 20, minute = 0): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_RISK_ID).catch(() => {});

  const target = new Date();
  target.setHours(hour, minute, 0, 0);
  if (hasCheckedInToday || target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_RISK_ID,
    content: {
      title: "Don't lose your streak",
      body: "You haven't checked in today -- a quick session keeps it alive.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
    },
  });
}

export async function setupNotifications(hasCheckedInToday: boolean): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await scheduleDailyWorkoutReminder();
  await rescheduleStreakRiskNudge(hasCheckedInToday);
}
