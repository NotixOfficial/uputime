import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  Header,
  AppText,
  Card,
  ListRow,
  Button,
  Badge,
  SectionHeader,
  Icon,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { LANGUAGES } from '../../i18n';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const signOut = useAuthStore(s => s.signOut);
  const language = useSettingsStore(s => s.language);

  const langLabel = t(LANGUAGES.find(l => l.code === language)?.labelKey ?? 'language.srLatn');

  return (
    <Screen header={<Header title={t('profile.title')} />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Korisnička kartica */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Icon name="user" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <AppText variant="title">{isAuth ? user?.name : t('profile.guestName')}</AppText>
              {isAuth && <Badge label={t('profile.syncOn')} tone="success" />}
            </View>
            <AppText variant="caption" muted style={{ marginTop: 2 }}>
              {isAuth ? user?.email : t('profile.guestSubtitle')}
            </AppText>
          </View>
        </Card>

        {!isAuth && (
          <View style={styles.authButtons}>
            <Button
              title={t('profile.signIn')}
              onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
              style={{ flex: 1 }}
            />
            <Button
              title={t('profile.register')}
              variant="secondary"
              onPress={() => navigation.navigate('Auth', { mode: 'register' })}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* Nalog */}
        <View style={styles.section}>
          <SectionHeader title={t('profile.accountSection')} />
          <Card padded={false}>
            <ListRow
              icon="message"
              title={t('profile.history')}
              onPress={() => navigation.navigate('History')}
            />
          </Card>
          {!isAuth && (
            <AppText variant="caption" muted style={styles.note}>
              {t('profile.registerBenefit')}
            </AppText>
          )}
        </View>

        {/* Podešavanja */}
        <View style={styles.section}>
          <SectionHeader title={t('profile.settingsSection')} />
          <Card padded={false}>
            <ListRow
              icon="globe"
              title={t('profile.language')}
              onPress={() => navigation.navigate('Language')}
              right={<AppText variant="caption" muted>{langLabel}</AppText>}
              showChevron={false}
            />
            <View style={styles.sep} />
            <ListRow
              icon="lock"
              title={t('profile.privacy')}
              onPress={() => navigation.navigate('Privacy')}
            />
            <View style={styles.sep} />
            <ListRow
              icon="info"
              title={t('profile.about')}
              onPress={() => navigation.navigate('About')}
            />
          </Card>
        </View>

        {isAuth && (
          <View style={styles.section}>
            <Button title={t('profile.signOut')} icon="log-out" variant="danger" onPress={signOut} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  authButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  section: { marginTop: spacing.xl },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
  note: { marginTop: spacing.sm, marginHorizontal: spacing.xs },
});
