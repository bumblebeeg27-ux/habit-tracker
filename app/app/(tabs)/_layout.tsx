import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

function TabIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: ColorValue }) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B6FF3C',
        tabBarInactiveTintColor: '#9BA895',
        tabBarStyle: {
          backgroundColor: '#05070A',
          borderTopColor: '#1C2318',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'barbell' : 'barbell-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          title: 'Diet',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'nutrition' : 'nutrition-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
