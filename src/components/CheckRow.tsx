import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon } from './Icon';
import { haptics } from '../utils/haptics';

interface CheckRowProps {
  checked: boolean;
  title: string;
  subtitle?: string;
  onToggle: () => void;
  right?: React.ReactNode;
  /** Precrtaj i utišaj naslov kad je čekirano (za "imam" čekliste).
   *  Za toggle opcije (npr. podsetnici) postavi na false. */
  strikeOnCheck?: boolean;
}

export function CheckRow({
  checked,
  title,
  subtitle,
  onToggle,
  right,
  strikeOnCheck = true,
}: CheckRowProps) {
  const dim = checked && strikeOnCheck;
  const handleToggle = () => {
    haptics.light();
    onToggle();
  };
  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={title}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Icon name="check" size={15} color={colors.white} strokeWidth={2.5} />}
      </View>
      <View style={styles.main}>
        <AppText
          variant="label"
          weight={dim ? 'regular' : 'semibold'}
          color={dim ? colors.muted : colors.ink}
          style={dim ? styles.strike : undefined}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="caption" muted style={{ marginTop: 2 }}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
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
    minHeight: HIT_TARGET,
  },
  pressed: { backgroundColor: colors.surface2 },
  box: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  main: { flex: 1, minWidth: 0 },
  strike: { textDecorationLine: 'line-through' },
});
