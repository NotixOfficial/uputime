import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '../theme';

type Variant =
  | 'display'
  | 'h1'
  | 'title'
  | 'subtitle'
  | 'bodyLg'
  | 'body'
  | 'caption'
  | 'eyebrow'
  | 'label';

interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  weight?: keyof typeof fontWeight;
  children: React.ReactNode;
}

const VARIANT: Record<Variant, TextStyle> = {
  display: { fontSize: fontSize.display, fontWeight: fontWeight.semibold, color: colors.ink, lineHeight: fontSize.display * 1.2 },
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.semibold, color: colors.ink, lineHeight: fontSize.h1 * 1.2 },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.semibold, color: colors.ink, lineHeight: fontSize.title * 1.25 },
  subtitle: { fontSize: fontSize.subtitle, fontWeight: fontWeight.semibold, color: colors.ink },
  bodyLg: { fontSize: fontSize.bodyLg, fontWeight: fontWeight.regular, color: colors.ink2, lineHeight: fontSize.bodyLg * 1.5 },
  body: { fontSize: fontSize.body, fontWeight: fontWeight.regular, color: colors.ink2, lineHeight: fontSize.body * 1.5 },
  caption: { fontSize: fontSize.caption, fontWeight: fontWeight.regular, color: colors.muted, lineHeight: fontSize.caption * 1.4 },
  eyebrow: { fontSize: fontSize.eyebrow, fontWeight: fontWeight.semibold, color: colors.muted, letterSpacing: 0.4, textTransform: 'uppercase' },
  label: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.ink },
};

export function AppText({
  variant = 'body',
  color,
  muted,
  center,
  weight,
  style,
  children,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.6}
      style={[
        VARIANT[variant],
        muted && { color: colors.muted },
        color && { color },
        weight && { fontWeight: fontWeight[weight] },
        center && styles.center,
        style,
      ]}
      {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
