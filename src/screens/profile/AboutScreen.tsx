import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Icon } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'About'>;

export function AboutScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  return (
    <Screen header={<Header title={t('about.title')} onBack={() => navigation.goBack()} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Icon name="compass" size={32} color={colors.primary} />
          </View>
          <AppText variant="title" style={{ marginTop: spacing.md }}>
            {t('common.appName')}
          </AppText>
          <AppText variant="caption" muted>
            {t('about.version')} 1.0.0
          </AppText>
        </View>
        <Card soft>
          <AppText variant="body">{t('about.body')}</AppText>
        </Card>
        <AppText variant="caption" muted center style={{ marginTop: spacing.xl }}>
          Interakcija čovek-računar · FTN 2025/2026 · Tim 9
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl, gap: 2 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
