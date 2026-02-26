import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" options={{ title: '相机' }} />
      <Stack.Screen
        name="templates"
        options={{
          title: '模版',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
