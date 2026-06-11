import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon, IconName } from './Icon';

interface ListRowProps {
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function ListRow({
  icon,
  iconColor = colors.primary,
  iconBg = colors.primarySoft,
  title,
  subtitle,
  right,
  showChevron = true,
  onPress,
  accessibilityLabel,
}: ListRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}>
      {icon && (
        <View style={[styles.icon, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={20} color={iconColor} />
        </View>
      )}
      <View style={styles.main}>
        <AppText variant="label" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" muted numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
      {showChevron && onPress && (
        <Icon name="chevron-right" size={20} color={colors.muted2} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: HIT_TARGET + 12,
  },
  pressed: { backgroundColor: colors.surface2 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, minWidth: 0 },
});
