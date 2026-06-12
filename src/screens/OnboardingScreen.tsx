import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, AppText, Button, Icon, IconName } from '../components';
import { colors, radius, spacing } from '../theme';
import { useSettingsStore } from '../store/useSettingsStore';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
  icon: IconName;
  titleKey: string;
  bodyKey: string;
  tint: string;
  tintBg: string;
}

const SLIDES: Slide[] = [
  { icon: 'message', titleKey: 'onboarding.slide1Title', bodyKey: 'onboarding.slide1Body', tint: colors.primary, tintBg: colors.primarySoft },
  { icon: 'documents', titleKey: 'onboarding.slide2Title', bodyKey: 'onboarding.slide2Body', tint: colors.primary, tintBg: colors.primarySoft },
  { icon: 'bell', titleKey: 'onboarding.slide3Title', bodyKey: 'onboarding.slide3Body', tint: colors.primary, tintBg: colors.primarySoft },
];

export function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const completeOnboarding = useSettingsStore(s => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    navigation.replace('Main', { screen: 'AskTab', params: { screen: 'ChatHome' } });
  };

  const next = () => (isLast ? finish() : setIndex(i => i + 1));

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <Pressable onPress={finish} hitSlop={10} accessibilityRole="button">
          <AppText variant="caption" weight="semibold" muted>
            {t('onboarding.skip')}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: slide.tintBg }]}>
          <Icon name={slide.icon} size={48} color={slide.tint} strokeWidth={1.6} />
        </View>
        <AppText variant="display" center style={styles.title}>
          {t(slide.titleKey)}
        </AppText>
        <AppText variant="bodyLg" muted center>
          {t(slide.bodyKey)}
        </AppText>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button title={isLast ? t('onboarding.getStarted') : t('common.next')} onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: radius.xxl + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.xs },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 22 },
});
