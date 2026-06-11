import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { Icon } from './Icon';

interface ComposerProps {
  placeholder: string;
  onSend: (text: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function Composer({ placeholder, onSend, disabled, autoFocus }: ComposerProps) {
  const [value, setValue] = useState('');
  const canSend = value.trim().length > 0 && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.inner}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          maxFontSizeMultiplier={1.6}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          autoFocus={autoFocus}
          multiline
          accessibilityLabel={placeholder}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Pošalji"
          style={[styles.send, !canSend && styles.sendDisabled]}>
          <Icon name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    maxHeight: 120,
    paddingVertical: spacing.sm,
  },
  send: {
    width: HIT_TARGET - 8,
    height: HIT_TARGET - 8,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { backgroundColor: colors.muted2 },
});
