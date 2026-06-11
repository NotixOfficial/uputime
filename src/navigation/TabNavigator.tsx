import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { TabBar } from './TabBar';
import { AskStack, DocumentsStack, MapStack, RemindersStack, ProfileStack } from './stacks';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Stabilna referenca van komponente: renderuje TabBar kao komponentu (hooks rade ispravno)
// i izbegava "no-unstable-nested-components" upozorenje.
const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderTabBar}>
      <Tab.Screen name="AskTab" component={AskStack} />
      <Tab.Screen name="DocumentsTab" component={DocumentsStack} />
      <Tab.Screen name="MapTab" component={MapStack} />
      <Tab.Screen name="RemindersTab" component={RemindersStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}
