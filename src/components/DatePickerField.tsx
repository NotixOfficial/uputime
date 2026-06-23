import React, { useMemo, useState } from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon } from './Icon';
import { haptics } from '../utils/haptics';
import { parseDMY, formatDate } from '../utils/date';

interface DatePickerFieldProps {
  label?: string;
  required?: boolean;
  /** Tekst datuma DD.MM.YYYY (izvor istine — kompatibilno sa validacijom). */
  value: string;
  /** Vraća izabrani datum kao DD.MM.YYYY tekst. */
  onChange: (text: string) => void;
  /** Pozvano kad se izbor potvrdi/zatvori (za „touched" stanje validacije). */
  onBlur?: () => void;
  error?: string;
  warning?: string;
  success?: boolean;
  placeholder?: string;
}

/**
 * Polje za datum sa kalendar-modalom (umesto ručnog upisivanja) — bolji UX, nemoguć
 * nevalidan format. Vizuelno se poklapa sa <Input> (greška/upozorenje/uspeh + fokus okvir).
 */
export function DatePickerField({
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  warning,
  success,
  placeholder,
}: DatePickerFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedIso = parseDMY(value);
  const selected = selectedIso ? dayjs(selectedIso) : null;
  const [view, setView] = useState(() => selected ?? dayjs());

  const months = t('datepicker.months', { returnObjects: true }) as unknown as string[];
  const weekdays = [0, 1, 2, 3, 4, 5, 6].map(d => t(`map.days.${d}`));

  // Mreža dana (ponedeljak prvi).
  const cells = useMemo(() => {
    const start = view.startOf('month');
    const lead = (start.day() + 6) % 7; // 0=Pon
    const total = view.daysInMonth();
    const arr: (number | null)[] = [];
    for (let i = 0; i < lead; i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const today = dayjs();

  const openPicker = () => {
    setView(selected ?? dayjs());
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const pick = (day: number) => {
    const chosen = view.date(day);
    haptics.light();
    onChange(formatDate(chosen.toISOString()));
    setOpen(false);
    onBlur?.();
  };

  // Prioritet okvira: greška > upozorenje > izabrano(uspeh) > mirno.
  const borderColor = error ? colors.danger : warning ? colors.warn : open ? colors.primary : success ? colors.success : colors.border;
  const message = error ?? warning ?? placeholder;
  const messageColor = error ? colors.danger : warning ? colors.accentInk : colors.muted;

  return (
    <View style={styles.wrap}>
      {label && (
        <AppText variant="caption" weight="semibold" color={colors.ink2} style={styles.label}>
          {label}
          {required && <AppText variant="caption" weight="semibold" color={colors.danger}> *</AppText>}
        </AppText>
      )}

      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? ''}${required ? `, ${t('common.required')}` : ''}`}
        accessibilityValue={{ text: value || (placeholder ?? '') }}
        style={[styles.field, { borderColor, borderWidth: open || error || warning ? 1.5 : 1 }]}>
        <Icon name="calendar" size={18} color={value ? colors.primary : colors.muted} />
        <AppText variant="bodyLg" color={value ? colors.ink : colors.muted} style={styles.fieldText}>
          {value || placeholder || t('datepicker.title')}
        </AppText>
        {(error || warning || success) && (
          <Icon
            name={error ? 'alert-circle' : warning ? 'alert-triangle' : 'check-circle'}
            size={18}
            color={error ? colors.danger : warning ? colors.warn : colors.success}
          />
        )}
      </Pressable>

      {message && (
        <View style={styles.messageRow} accessibilityLiveRegion={error || warning ? 'polite' : 'none'}>
          {(error || warning) && (
            <Icon name={error ? 'alert-circle' : 'alert-triangle'} size={13} color={error ? colors.danger : colors.accentInk} />
          )}
          <AppText variant="caption" color={messageColor} style={styles.flex}>
            {message}
          </AppText>
        </View>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.calendar} onPress={() => {}}>
            {/* Zaglavlje: « ‹ Mesec Godina › » */}
            <View style={styles.calHead}>
              <NavBtn label="«" onPress={() => setView(v => v.subtract(1, 'year'))} a11y={t('datepicker.prevYear')} />
              <NavBtn label="‹" onPress={() => setView(v => v.subtract(1, 'month'))} a11y={t('datepicker.prevMonth')} />
              <AppText variant="subtitle" center style={styles.flex}>
                {months[view.month()]} {view.year()}
              </AppText>
              <NavBtn label="›" onPress={() => setView(v => v.add(1, 'month'))} a11y={t('datepicker.nextMonth')} />
              <NavBtn label="»" onPress={() => setView(v => v.add(1, 'year'))} a11y={t('datepicker.nextYear')} />
            </View>

            {/* Dani u nedelji */}
            <View style={styles.weekRow}>
              {weekdays.map((w, i) => (
                <AppText key={i} variant="caption" weight="semibold" muted center style={styles.cell}>
                  {w}
                </AppText>
              ))}
            </View>

            {/* Mreža */}
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={i} style={styles.cell} />;
                const cellDate = view.date(day);
                const isSel = selected ? cellDate.isSame(selected, 'day') : false;
                const isToday = cellDate.isSame(today, 'day');
                return (
                  <Pressable
                    key={i}
                    onPress={() => pick(day)}
                    accessibilityRole="button"
                    accessibilityLabel={formatDate(cellDate.toISOString())}
                    accessibilityState={{ selected: isSel }}
                    style={styles.cell}>
                    <View style={[styles.day, isSel && styles.daySel, !isSel && isToday && styles.dayToday]}>
                      <AppText
                        variant="body"
                        center
                        weight={isSel || isToday ? 'semibold' : 'regular'}
                        color={isSel ? colors.white : isToday ? colors.primary : colors.ink}>
                        {day}
                      </AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={close} style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.6 }]} accessibilityRole="button">
              <AppText variant="label" weight="semibold" color={colors.primary} center>
                {t('common.cancel')}
              </AppText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function NavBtn({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={a11y} style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.5 }]}>
      <AppText variant="title" color={colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { marginLeft: 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: HIT_TARGET,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldText: { flex: 1 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginLeft: 2 },
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  calendar: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  calHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  navBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  daySel: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1.5, borderColor: colors.primarySoft2 },
  cancel: { marginTop: spacing.sm, paddingVertical: spacing.sm, minHeight: HIT_TARGET, justifyContent: 'center' },
});
