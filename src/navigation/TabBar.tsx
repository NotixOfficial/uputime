import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Icon, IconName, AppText } from '../components';
import { colors, spacing } from '../theme';

const TAB_META: Record<string, { icon: IconName; labelKey: string }> = {
  AskTab: { icon: 'chat', labelKey: 'tabs.ask' },
  DocumentsTab: { icon: 'documents', labelKey: 'tabs.documents' },
  MapTab: { icon: 'map', labelKey: 'tabs.map' },
  RemindersTab: { icon: 'bell', labelKey: 'tabs.reminders' },
  ProfileTab: { icon: 'user', labelKey: 'tabs.profile' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const meta = TAB_META[route.name];
        if (!meta) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () =>
          navigation.emit({ type: 'tabLongPress', target: route.key });

        const color = focused ? colors.primary : colors.muted;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t(meta.labelKey)}
            style={styles.tab}>
            {focused && <View style={styles.indicator} />}
            <Icon name={meta.icon} size={22} color={color} strokeWidth={focused ? 2 : 1.7} />
            <AppText variant="caption" weight={focused ? 'semibold' : 'regular'} color={color} style={styles.label}>
              {t(meta.labelKey)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -spacing.sm,
    left: '22%',
    right: '22%',
    height: 2,
    backgroundColor: colors.primary,
  },
  label: { fontSize: 11 },
});
