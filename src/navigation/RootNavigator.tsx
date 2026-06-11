import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useSettingsStore } from '../store/useSettingsStore';
import { colors } from '../theme';
import { Icon } from '../components';

const Root = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
    notification: colors.accent,
  },
};

function Splash() {
  return (
    <View style={styles.splash}>
      <View style={styles.logo}>
        <Icon name="compass" size={32} color={colors.primary} />
      </View>
    </View>
  );
}

export function RootNavigator() {
  const hydrated = useSettingsStore(s => s.hydrated);
  const onboardingCompleted = useSettingsStore(s => s.onboardingCompleted);

  if (!hydrated) return <Splash />;

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingCompleted && <Root.Screen name="Onboarding" component={OnboardingScreen} />}
        <Root.Screen name="Main" component={TabNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
