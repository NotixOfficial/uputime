import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon, IconName } from './Icon';

/* ─────────────── Chip ─────────────── */

export function Chip({
  label,
  tone = 'neutral',
  selected,
  onPress,
  icon,
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'danger';
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const bgMap = {
    neutral: colors.surface2,
    primary: colors.primarySoft,
    accent: colors.accentSoft,
    success: colors.successSoft,
    danger: colors.dangerSoft,
  };
  const fgMap = {
    neutral: colors.muted,
    primary: colors.primaryInk,
    accent: colors.accentInk,
    success: colors.successInk,
    danger: colors.dangerInk,
  };
  const baseStyle = [
    styles.chip,
    { backgroundColor: selected ? colors.primary : bgMap[tone] },
    selected && { borderColor: colors.primary },
  ];
  const inner = (
    <>
      {icon && (
        <Icon name={icon} size={13} color={selected ? colors.white : fgMap[tone]} strokeWidth={2} />
      )}
      <AppText variant="caption" weight="semibold" color={selected ? colors.white : fgMap[tone]}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) return <View style={baseStyle}>{inner}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [baseStyle, pressed && styles.chipPressed]}>
      {inner}
    </Pressable>
  );
}

/* ─────────────── SectionHeader ─────────────── */

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="subtitle">{title}</AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <AppText variant="caption" weight="semibold" color={colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────── ProgressBar ─────────────── */

export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View
      style={styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

/* ─────────────── Badge ─────────────── */

export function Badge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warn' | 'danger';
}) {
  const map = {
    neutral: { bg: colors.surface2, fg: colors.muted },
    primary: { bg: colors.primarySoft, fg: colors.primaryInk },
    success: { bg: colors.successSoft, fg: colors.successInk },
    warn: { bg: colors.warnSoft, fg: colors.accentInk },
    danger: { bg: colors.dangerSoft, fg: colors.dangerInk },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <AppText variant="caption" weight="semibold" color={map.fg}>
        {label}
      </AppText>
    </View>
  );
}

/* ─────────────── IconButton ─────────────── */

export function IconButton({
  name,
  onPress,
  color = colors.ink,
  accessibilityLabel,
  size = 22,
  checked,
}: {
  name: IconName;
  onPress?: () => void;
  color?: string;
  accessibilityLabel: string;
  size?: number;
  /** Za toggle dugmad (npr. prikaz lozinke) — saopštava trenutno stanje čitaču ekrana. */
  checked?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={checked === undefined ? undefined : { checked }}
      hitSlop={10}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }]}>
      <Icon name={name} size={size} color={color} />
    </Pressable>
  );
}

/* ─────────────── Divider ─────────────── */

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

/* ─────────────── EmptyState ─────────────── */

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={26} color={colors.muted2} />
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {body && (
        <AppText variant="body" muted center style={{ marginTop: spacing.xs }}>
          {body}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipPressed: { opacity: 0.7 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  iconButton: {
    minWidth: HIT_TARGET,
    minHeight: HIT_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
