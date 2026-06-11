import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
}

export function Input({ label, helper, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label && (
        <AppText variant="caption" weight="semibold" color={colors.ink2} style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.muted}
        maxFontSizeMultiplier={1.6}
        {...rest}
      />
      {helper && (
        <AppText variant="caption" muted style={styles.helper}>
          {helper}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { marginLeft: 2 },
  input: {
    minHeight: HIT_TARGET,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
  },
  helper: { marginLeft: 2 },
});
