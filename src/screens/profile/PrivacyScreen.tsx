import React from 'react';
import { ScrollView, View, StyleSheet, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Button, Icon } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useReminderStore } from '../../store/useReminderStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useChatStore } from '../../store/useChatStore';
import { clearAllLocalData } from '../../store/storage';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Privacy'>;

export function PrivacyScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const syncConsent = useSettingsStore(s => s.syncConsent);
  const setSyncConsent = useSettingsStore(s => s.setSyncConsent);
  const isAuth = useAuthStore(s => s.isAuthenticated);

  const clearData = () => {
    Alert.alert(t('privacy.clearData'), t('privacy.clearData') + '?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          // clearReminders otkazuje zakazane notifikacije i briše osetljive reference.
          await useReminderStore.getState().clearReminders();
          useProgressStore.setState({ byProcedure: {} });
          useChatStore.setState({ conversations: [], currentId: null });
          useAuthStore.getState().signOut();
          await clearAllLocalData();
        },
      },
    ]);
  };

  return (
    <Screen header={<Header title={t('privacy.title')} onBack={() => navigation.goBack()} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card soft style={{ marginBottom: spacing.lg }}>
          <View style={styles.iconRow}>
            <View style={styles.icon}>
              <Icon name="shield" size={20} color={colors.primary} />
            </View>
            <AppText variant="body" style={{ flex: 1 }}>
              {t('privacy.body')}
            </AppText>
          </View>
        </Card>

        <Card padded={false}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="label">{t('privacy.syncToggle')}</AppText>
              {!isAuth && (
                <AppText variant="caption" muted style={{ marginTop: 2 }}>
                  {t('profile.registerBenefit')}
                </AppText>
              )}
            </View>
            <Switch
              value={syncConsent && isAuth}
              onValueChange={setSyncConsent}
              disabled={!isAuth}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <Button title={t('privacy.clearData')} icon="trash" variant="danger" onPress={clearData} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  iconRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
});
