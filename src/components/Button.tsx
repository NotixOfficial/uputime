import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon, IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled,
  loading,
  fullWidth = true,
  style,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const bg =
    variant === 'primary' ? colors.primary
    : variant === 'danger' ? colors.dangerSoft
    : variant === 'secondary' ? colors.surface
    : 'transparent';
  const fg =
    isPrimary ? colors.white
    : isDanger ? colors.danger
    : variant === 'secondary' ? colors.ink
    : colors.primary;
  const border = variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg, borderColor: border },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon && <Icon name={icon} size={18} color={fg} />}
          <AppText weight="semibold" color={fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HIT_TARGET,
  },
  md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
});
