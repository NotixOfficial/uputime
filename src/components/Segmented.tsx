import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && !active && styles.itemPressed]}>
            <AppText
              variant="caption"
              weight="semibold"
              color={active ? colors.ink : colors.muted}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    minHeight: HIT_TARGET - 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  itemActive: {
    backgroundColor: colors.surface,
    shadowColor: '#0b2530',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemPressed: { opacity: 0.6 },
});
