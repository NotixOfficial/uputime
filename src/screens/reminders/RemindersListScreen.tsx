import React from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  Header,
  AppText,
  Card,
  Button,
  Badge,
  Chip,
  IconButton,
  EmptyState,
  Icon,
  useToast,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useReminderStore } from '../../store/useReminderStore';
import { formatDate, daysUntil } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { Reminder } from '../../data/types';
import { RemindersStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RemindersStackParamList, 'RemindersList'>;

export function RemindersListScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation<Nav>();
  const reminders = useReminderStore(s => s.reminders);
  const removeReminder = useReminderStore(s => s.removeReminder);

  const sorted = [...reminders].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

  // Potvrda pre brisanja (sprečavanje grešaka) + povratna informacija o ishodu.
  const confirmDelete = (r: Reminder) => {
    Alert.alert(
      t('reminders.deleteConfirm', { documentType: r.documentType }),
      t('reminders.deleteConfirmBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReminder(r.id);
              haptics.light();
              toast.show(t('feedback.reminderDeleted'), { tone: 'info' });
            } catch {
              toast.show(t('feedback.reminderDeleteFailed'), { tone: 'error' });
            }
          },
        },
      ],
    );
  };

  const statusFor = (iso: string): { label: string; tone: 'success' | 'warn' | 'danger' } => {
    const d = daysUntil(iso);
    if (d < 0) return { label: t('reminders.expired'), tone: 'danger' };
    if (d === 0) return { label: t('reminders.expiresToday'), tone: 'danger' };
    if (d <= 30) return { label: t('reminders.daysLeft', { count: d }), tone: 'warn' };
    return { label: t('reminders.daysLeft', { count: d }), tone: 'success' };
  };

  return (
    <Screen
      header={<Header title={t('reminders.title')} />}
      footer={
        <View style={styles.footer}>
          <Button
            title={t('reminders.add')}
            icon="plus"
            onPress={() => navigation.navigate('NewReminder', {})}
          />
        </View>
      }>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="body" muted style={{ marginBottom: spacing.lg }}>
          {t('reminders.subtitle')}
        </AppText>

        {sorted.length === 0 ? (
          <EmptyState icon="bell" title={t('reminders.empty')} />
        ) : (
          <View style={{ gap: spacing.md }}>
            {sorted.map(r => {
              const st = statusFor(r.expiryDate);
              return (
                <Card key={r.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <View style={styles.cardIcon}>
                      <Icon name="calendar" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="label">{r.documentType}</AppText>
                      <AppText variant="caption" muted style={{ marginTop: 2 }}>
                        {t('reminders.expiresOn', { date: formatDate(r.expiryDate) })}
                      </AppText>
                    </View>
                    <IconButton
                      name="trash"
                      onPress={() => confirmDelete(r)}
                      color={colors.muted2}
                      accessibilityLabel={t('common.delete')}
                      size={18}
                    />
                  </View>
                  <View style={styles.cardFoot}>
                    <Badge label={st.label} tone={st.tone} />
                    <View style={styles.offsets}>
                      {r.notifyDaysBefore.map(d => (
                        <Chip key={d} label={`${d}d`} tone="neutral" icon="bell" />
                      ))}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  card: { gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  offsets: { flex: 1, flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', justifyContent: 'flex-end' },
});
