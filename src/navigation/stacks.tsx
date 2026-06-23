import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AskStackParamList,
  DocumentsStackParamList,
  MapStackParamList,
  RemindersStackParamList,
  ProfileStackParamList,
} from './types';

import { ChatHomeScreen } from '../screens/ask/ChatHomeScreen';
import { ConversationScreen } from '../screens/ask/ConversationScreen';
import { DocumentsListScreen } from '../screens/documents/DocumentsListScreen';
import { ProcedureDetailScreen } from '../screens/documents/ProcedureDetailScreen';
import { MapHomeScreen } from '../screens/map/MapHomeScreen';
import { InstitutionDetailScreen } from '../screens/map/InstitutionDetailScreen';
import { RemindersListScreen } from '../screens/reminders/RemindersListScreen';
import { NewReminderScreen } from '../screens/reminders/NewReminderScreen';
import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { AuthScreen } from '../screens/profile/AuthScreen';
import { LanguageScreen } from '../screens/profile/LanguageScreen';
import { HistoryScreen } from '../screens/profile/HistoryScreen';
import { PrivacyScreen } from '../screens/profile/PrivacyScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';

const noHeader = { headerShown: false } as const;

const Ask = createNativeStackNavigator<AskStackParamList>();
export function AskStack() {
  return (
    <Ask.Navigator screenOptions={noHeader}>
      <Ask.Screen name="ChatHome" component={ChatHomeScreen} />
      <Ask.Screen name="Conversation" component={ConversationScreen} />
    </Ask.Navigator>
  );
}

const Documents = createNativeStackNavigator<DocumentsStackParamList>();
export function DocumentsStack() {
  return (
    <Documents.Navigator screenOptions={noHeader}>
      <Documents.Screen name="DocumentsList" component={DocumentsListScreen} />
      <Documents.Screen name="ProcedureDetail" component={ProcedureDetailScreen} />
    </Documents.Navigator>
  );
}

const Map = createNativeStackNavigator<MapStackParamList>();
export function MapStack() {
  return (
    <Map.Navigator screenOptions={noHeader}>
      <Map.Screen name="MapHome" component={MapHomeScreen} />
      <Map.Screen name="InstitutionDetail" component={InstitutionDetailScreen} />
    </Map.Navigator>
  );
}

const Reminders = createNativeStackNavigator<RemindersStackParamList>();
export function RemindersStack() {
  return (
    <Reminders.Navigator screenOptions={noHeader}>
      <Reminders.Screen name="RemindersList" component={RemindersListScreen} />
      <Reminders.Screen name="NewReminder" component={NewReminderScreen} />
    </Reminders.Navigator>
  );
}

const Profile = createNativeStackNavigator<ProfileStackParamList>();
export function ProfileStack() {
  return (
    <Profile.Navigator screenOptions={noHeader}>
      <Profile.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Profile.Screen name="Auth" component={AuthScreen} />
      <Profile.Screen name="History" component={HistoryScreen} />
      <Profile.Screen name="Language" component={LanguageScreen} />
      <Profile.Screen name="Privacy" component={PrivacyScreen} />
      <Profile.Screen name="About" component={AboutScreen} />
    </Profile.Navigator>
  );
}
