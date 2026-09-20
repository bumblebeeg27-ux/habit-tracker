import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserProfile } from '../db/schema';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const STREAK_RISK_ID = 'streak-risk-nudge';
const MOTIVATIONAL_ID_PREFIX = 'motivational-';
const MOTIVATIONAL_DAYS = 14;

const GOAL_PHRASES: Record<UserProfile['goal'], string> = {
  fat_loss: 'losing fat',
  muscle_gain: 'building muscle',
  strength: 'getting stronger',
  endurance: 'building your endurance',
  general_fitness: 'staying fit',
};

const QUOTE_TEMPLATES = [
  "Every rep today is a step closer to {goal}.",
  "Consistency beats intensity -- show up for your goal of {goal}.",
  "Future you will thank today's you for training toward {goal}.",
  "Small sessions, big results. Stay on track for {goal}.",
  "You don't have to feel like it -- you just have to start. {goal_cap} is built one session at a time.",
  "Discipline today, results tomorrow. Keep {goal} in sight.",
  "The gym is calling -- your goal of {goal} is waiting.",
  "One more workout, one step closer to {goal}.",
  "Progress isn't always visible day to day, but it adds up. Keep {goal} in motion.",
  "Nobody regrets a workout. Get after {goal} today.",
  "Show up for yourself today -- {goal} doesn't happen by accident.",
  "The hardest part is starting. You've got this -- go work toward {goal}.",
];

function pickQuote(goal: UserProfile['goal']): string {
  const template = QUOTE_TEMPLATES[Math.floor(Math.random() * QUOTE_TEMPLATES.length)];
  const phrase = GOAL_PHRASES[goal];
  return template
    .replace('{goal_cap}', phrase.charAt(0).toUpperCase() + phrase.slice(1))
    .replace('{goal}', phrase);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Local notifications can't pick new content at delivery time -- their body
 * is fixed when scheduled. To get a different motivational quote each day,
 * this pre-schedules a rolling window of one-time notifications (one per
 * day, each with its own randomly chosen quote) rather than a single
 * repeating daily trigger with static text. Call again periodically (e.g.
 * on app open) to keep the window topped up.
 */
export async function scheduleMotivationalReminders(
  goal: UserProfile['goal'],
  hour = 8,
  minute = 0,
): Promise<void> {
  for (let i = 0; i < MOTIVATIONAL_DAYS; i++) {
    await Notifications.cancelScheduledNotificationAsync(`${MOTIVATIONAL_ID_PREFIX}${i}`).catch(() => {});
  }

  const base = new Date();
  base.setHours(hour, minute, 0, 0);
  if (base.getTime() <= Date.now()) base.setDate(base.getDate() + 1);

  for (let i = 0; i < MOTIVATIONAL_DAYS; i++) {
    const target = new Date(base);
    target.setDate(target.getDate() + i);
    await Notifications.scheduleNotificationAsync({
      identifier: `${MOTIVATIONAL_ID_PREFIX}${i}`,
      content: {
        title: 'Keep going 💪',
        body: pickQuote(goal),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
      },
    });
  }
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

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(STREAK_RISK_ID).catch(() => {});
  for (let i = 0; i < MOTIVATIONAL_DAYS; i++) {
    await Notifications.cancelScheduledNotificationAsync(`${MOTIVATIONAL_ID_PREFIX}${i}`).catch(() => {});
  }
}

export async function setupNotifications(
  profile: { goal: UserProfile['goal']; notificationsEnabled: boolean },
  hasCheckedInToday: boolean,
): Promise<void> {
  if (!profile.notificationsEnabled) {
    await cancelAllReminders();
    return;
  }
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await scheduleMotivationalReminders(profile.goal);
  await rescheduleStreakRiskNudge(hasCheckedInToday);
}
