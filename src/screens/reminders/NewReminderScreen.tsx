import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Button, Chip, Input, DatePickerField, CheckRow, useToast } from '../../components';
import { colors, spacing } from '../../theme';
import { useReminderStore, DEFAULT_NOTIFY_DAYS } from '../../store/useReminderStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { requestNotificationPermission, displayDemoNotification } from '../../services/notifications';
import { parseDMY, isoInYears, formatDate } from '../../utils/date';
import { useField, validateAll } from '../../hooks/useField';
import { validateRequired, validateExpiryDate, expiryDateWarning } from '../../utils/validation';
import { haptics } from '../../utils/haptics';
import { RemindersStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RemindersStackParamList, 'NewReminder'>;
type Rt = RouteProp<RemindersStackParamList, 'NewReminder'>;

export function NewReminderScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation<Nav>();
  const paramType = useRoute<Rt>().params?.documentType;

  const addReminder = useReminderStore(s => s.addReminder);
  const setNotifText = useReminderStore(s => s.setNotifText);
  const setNotificationsEnabled = useSettingsStore(s => s.setNotificationsEnabled);

  const docType = useField(paramType ?? '', validateRequired('validation.documentTypeRequired'));
  const date = useField('', validateExpiryDate);
  const [sensitiveRef, setSensitiveRef] = useState('');
  const [offsets, setOffsets] = useState<Record<number, boolean>>({ 30: true, 7: true, 1: true });
  const [saving, setSaving] = useState(false);

  const presets: { key: string; label: string }[] = [
    { key: 'idCard', label: t('reminders.presets.idCard') },
    { key: 'passport', label: t('reminders.presets.passport') },
    { key: 'driverLicense', label: t('reminders.presets.driverLicense') },
    { key: 'vehicleReg', label: t('reminders.presets.vehicleReg') },
    { key: 'residence', label: t('reminders.presets.residence') },
  ];

  const parsedIso = parseDMY(date.value);
  // Meko upozorenje (ne blokira čuvanje) ako je validan datum već prošao.
  const pastWarn = expiryDateWarning(date.value);
  const dateWarning = !date.error && pastWarn ? t(pastWarn.key) : undefined;
  const noneSelected = !DEFAULT_NOTIFY_DAYS.some(d => offsets[d]);

  const toggleOffset = (d: number) => setOffsets(o => ({ ...o, [d]: !o[d] }));

  const onSave = async () => {
    if (!validateAll(docType, date) || !parsedIso) {
      haptics.error();
      toast.show(t('validation.formIncomplete'), { tone: 'error' });
      return;
    }
    setSaving(true);
    setNotifText({
      title: type => t('reminders.notifTitle', { type }),
      body: (_type, d) => t('reminders.expiresOn', { date: d }),
      channelName: t('reminders.notifChannelName'),
    });
    try {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      const notifyDaysBefore = DEFAULT_NOTIFY_DAYS.filter(d => offsets[d]);
      const reminder = await addReminder({
        documentType: docType.value.trim(),
        expiryDate: parsedIso,
        notifyDaysBefore: notifyDaysBefore.length ? notifyDaysBefore : [7],
        sensitiveRef: sensitiveRef.trim() || undefined,
      });
      haptics.success();

      // Demo: odmah prikaži kako obaveštenje izgleda (lokalno, radi offline).
      if (granted) {
        await displayDemoNotification(
          t('reminders.demoTitle'),
          t('reminders.demoBody', { type: docType.value.trim(), date: formatDate(parsedIso) }),
          t('reminders.notifChannelName'),
        );
      }

      // Upozori ako nijedan termin nije zakazan (svi su pre isteka već prošli).
      if (granted && (reminder.scheduledNotificationIds?.length ?? 0) === 0) {
        Alert.alert(t('reminders.newTitle'), t('reminders.noneScheduled'), [
          { text: t('common.done'), onPress: () => navigation.goBack() },
        ]);
        return;
      }
      toast.show(t('reminders.saved'), { tone: 'success' });
      navigation.goBack();
    } catch {
      toast.show(t('feedback.notificationSchedulingFailed'), { tone: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen header={<Header title={t('reminders.newTitle')} onBack={() => navigation.goBack()} />}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Input
          label={t('reminders.documentTypeLabel')}
          required
          placeholder={t('reminders.documentTypePlaceholder')}
          success={docType.touched && docType.valid && docType.value.length > 0}
          {...docType.inputProps}
        />
        <View style={styles.presets}>
          {presets.map(p => (
            <Chip
              key={p.key}
              label={p.label}
              selected={docType.value === p.label}
              onPress={() => docType.setValue(p.label)}
            />
          ))}
        </View>

        <DatePickerField
          label={t('reminders.expiryDateLabel')}
          required
          value={date.value}
          onChange={date.setValue}
          onBlur={date.touch}
          error={date.error}
          warning={dateWarning}
          success={!!parsedIso && !dateWarning && date.touched}
        />
        <View style={styles.presets}>
          <Chip label="+1 god." onPress={() => date.setValue(formatDate(isoInYears(1)))} />
          <Chip label="+5 god." onPress={() => date.setValue(formatDate(isoInYears(5)))} />
          <Chip label="+10 god." onPress={() => date.setValue(formatDate(isoInYears(10)))} />
        </View>

        <AppText variant="caption" weight="semibold" color={colors.ink2} style={styles.section}>
          {t('reminders.notifyBefore')}
        </AppText>
        <Card padded={false}>
          <CheckRow strikeOnCheck={false} checked={offsets[30]} title={t('reminders.notifyMonth')} onToggle={() => toggleOffset(30)} />
          <View style={styles.sep} />
          <CheckRow strikeOnCheck={false} checked={offsets[7]} title={t('reminders.notifyWeek')} onToggle={() => toggleOffset(7)} />
          <View style={styles.sep} />
          <CheckRow strikeOnCheck={false} checked={offsets[1]} title={t('reminders.notifyDay')} onToggle={() => toggleOffset(1)} />
        </Card>
        {noneSelected && (
          <AppText variant="caption" color={colors.accentInk} style={styles.hint}>
            {t('reminders.defaultNotifyDays')}
          </AppText>
        )}

        <Input
          label={t('reminders.documentNumberLabel')}
          placeholder="npr. 003456789"
          value={sensitiveRef}
          onChangeText={setSensitiveRef}
          style={{ marginTop: spacing.lg }}
          helper={t('privacy.body')}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('common.save')} onPress={onSave} loading={saving} />
      </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  section: { marginTop: spacing.sm, marginLeft: 2 },
  hint: { marginLeft: 2 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
