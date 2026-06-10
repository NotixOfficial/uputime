import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
  soft?: boolean;
  accessibilityLabel?: string;
}

export function Card({ children, onPress, style, padded = true, soft, accessibilityLabel }: CardProps) {
  const content = (
    <View
      style={[
        styles.card,
        soft && styles.soft,
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  soft: {
    backgroundColor: colors.surface2,
    shadowOpacity: 0,
    elevation: 0,
  },
  padded: { padding: spacing.md },
  pressed: { opacity: 0.85 },
});
