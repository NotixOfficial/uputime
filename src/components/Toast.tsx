import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Pressable, AccessibilityInfo, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow } from '../theme';
import { AppText } from './Text';
import { Icon, IconName } from './Icon';
import { haptics } from '../utils/haptics';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  tone?: ToastTone;
  /** Trajanje prikaza u ms (podrazumevano 2600). */
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

/** Neblokirajuća poruka o stanju sistema (Nielsen: vidljivost statusa sistema). */
export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}

const TONE: Record<ToastTone, { bg: string; fg: string; icon: IconName }> = {
  success: { bg: colors.successSoft, fg: colors.successInk, icon: 'check-circle' },
  error: { bg: colors.dangerSoft, fg: colors.dangerInk, icon: 'alert-circle' },
  warning: { bg: colors.warnSoft, fg: colors.accentInk, icon: 'alert-triangle' },
  info: { bg: colors.primarySoft, fg: colors.primaryInk, icon: 'info' },
};

interface ToastState {
  message: string;
  tone: ToastTone;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacity, translateY]);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const tone = options?.tone ?? 'info';
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (tone === 'error') haptics.error();
      else if (tone === 'success') haptics.success();
      setToast({ message, tone });
      AccessibilityInfo.announceForAccessibility?.(message);
      opacity.setValue(0);
      translateY.setValue(20);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 80 }),
      ]).start();
      // Duže poruke ostaju duže (dovoljno da ih čitač ekrana izgovori).
      const duration = options?.duration ?? Math.min(6000, Math.max(2600, message.length * 55));
      hideTimer.current = setTimeout(hide, duration);
    },
    [opacity, translateY, hide],
  );

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const palette = toast ? TONE[toast.tone] : null;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && palette && (
        <View
          style={[styles.host, { bottom: insets.bottom + spacing.huge + spacing.xxl }]}
          pointerEvents="box-none">
          <Animated.View style={{ opacity, transform: [{ translateY }], width: '100%', alignItems: 'center' }}>
            <Pressable
              onPress={hide}
              accessibilityRole="alert"
              accessibilityLabel={toast.message}
              style={[styles.toast, { backgroundColor: palette.bg }, shadow.floating]}>
              <Icon name={palette.icon} size={18} color={palette.fg} />
              <AppText variant="caption" weight="semibold" color={palette.fg} style={styles.text}>
                {toast.message}
              </AppText>
            </Pressable>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 480,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  text: { flexShrink: 1 },
});
