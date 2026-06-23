import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, HIT_TARGET } from '../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  helper?: string;
  /** Poruka greške (prevedena). Crveni okvir + ikonica + tekst; ima prioritet nad helper/warning. */
  error?: string;
  /** Meko upozorenje (prevedeno). Žuti okvir + tekst; ne znači nevalidno. */
  warning?: string;
  /** Prikaži zelenu potvrdu (polje validno). */
  success?: boolean;
  /** Obavezno polje — dodaje crvenu zvezdicu uz labelu. */
  required?: boolean;
  /** Sadržaj uz desnu ivicu polja (npr. dugme za prikaz lozinke). */
  rightSlot?: React.ReactNode;
  /** Sadržaj uz levu ivicu polja (npr. ikonica pretrage). */
  leftSlot?: React.ReactNode;
}

export function Input({
  label,
  helper,
  error,
  warning,
  success,
  required,
  rightSlot,
  leftSlot,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  const handleFocus: TextInputProps['onFocus'] = e => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: TextInputProps['onBlur'] = e => {
    setFocused(false);
    onBlur?.(e);
  };

  // Prioritet stanja: greška > upozorenje > fokus > uspeh > mirno.
  const borderColor = error
    ? colors.danger
    : warning
      ? colors.warn
      : focused
        ? colors.primary
        : success
          ? colors.success
          : colors.border;

  // Ikonica statusa uz desnu ivicu (kad nema custom rightSlot).
  const statusIcon = error
    ? { name: 'alert-circle' as const, color: colors.danger }
    : warning
      ? { name: 'alert-triangle' as const, color: colors.warn }
      : success
        ? { name: 'check-circle' as const, color: colors.success }
        : null;

  const message = error ?? warning ?? helper;
  const messageColor = error ? colors.danger : warning ? colors.accentInk : colors.muted;

  return (
    <View style={styles.wrap}>
      {label && (
        <AppText variant="caption" weight="semibold" color={colors.ink2} style={styles.label}>
          {label}
          {required && <AppText variant="caption" weight="semibold" color={colors.danger}> *</AppText>}
        </AppText>
      )}

      <View
        style={[
          styles.field,
          { borderColor, borderWidth: focused || error || warning ? 1.5 : 1 },
        ]}>
        {leftSlot}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          maxFontSizeMultiplier={1.6}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={required && label ? `${label}, ${t('common.required')}` : label}
          accessibilityHint={!error && !warning ? helper : undefined}
          {...rest}
        />
        {rightSlot ?? (statusIcon && <Icon name={statusIcon.name} size={18} color={statusIcon.color} />)}
      </View>

      {message && (
        <View style={styles.messageRow} accessibilityLiveRegion={error || warning ? 'polite' : 'none'}>
          {(error || warning) && (
            <Icon
              name={error ? 'alert-circle' : 'alert-triangle'}
              size={13}
              color={error ? colors.danger : colors.accentInk}
            />
          )}
          <AppText variant="caption" color={messageColor} style={styles.message}>
            {message}
          </AppText>
        </View>
      )}
    </View>
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
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.ink,
  },
  messageRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginLeft: 2 },
  message: { flex: 1 },
});
