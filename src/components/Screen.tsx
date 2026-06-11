import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { AppText } from './Text';
import { IconButton } from './primitives';

/** Gornja navigaciona traka (nav-row iz prototipa). */
export function Header({
  title,
  onBack,
  right,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack && <IconButton name="arrow-left" onPress={onBack} accessibilityLabel="Nazad" />}
      </View>
      {title ? (
        <AppText variant="subtitle" numberOfLines={1} style={styles.headerTitle}>
          {title}
        </AppText>
      ) : (
        <View style={styles.headerTitle} />
      )}
      <View style={[styles.headerSide, styles.headerRight]}>{right}</View>
    </View>
  );
}

interface ScreenProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  background?: string;
}

export function Screen({
  children,
  header,
  footer,
  edges = ['top'],
  style,
  background = colors.bg,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor: background }]}>
      {header}
      <View style={[styles.content, style]}>{children}</View>
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  headerSide: { minWidth: 44, justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end' },
  headerTitle: { flex: 1, textAlign: 'center' },
});
