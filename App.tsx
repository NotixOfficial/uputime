/**
 * Uputi Me — AI asistent za administrativne postupke lokalnih zajednica.
 * Interakcija čovek–računar · FTN 2025/2026 · Tim 9
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/i18n'; // inicijalizacija prevoda (sr-Latn / sr-Cyrl / en)
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastProvider } from './src/components';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
