import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Button, Input, IconButton, useToast } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useField, validateAll } from '../../hooks/useField';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import { haptics } from '../../utils/haptics';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Auth'>;
type Rt = RouteProp<ProfileStackParamList, 'Auth'>;

export function AuthScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation<Nav>();
  const initialMode = useRoute<Rt>().params?.mode ?? 'signin';
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  const signIn = useAuthStore(s => s.signIn);
  const register = useAuthStore(s => s.register);

  const isRegister = mode === 'register';
  const name = useField('', validateName);
  const email = useField('', validateEmail);
  const password = useField('', validatePassword(6));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const fields = isRegister ? [name, email, password] : [email, password];
    // Validacija pri slanju: ako nije ispravno, otkrij greške i reci zašto (umesto „mrtvog" dugmeta).
    if (!validateAll(...fields)) {
      haptics.error();
      toast.show(t('validation.formIncomplete'), { tone: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(name.value.trim(), email.value.trim(), password.value);
      else await signIn(email.value.trim(), password.value);
      haptics.success();
      toast.show(t(isRegister ? 'auth.registered' : 'auth.signedIn'), { tone: 'success' });
      navigation.goBack();
    } catch {
      toast.show(t('auth.failed'), { tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      header={
        <Header
          title={isRegister ? t('auth.registerTitle') : t('auth.signInTitle')}
          onBack={() => navigation.goBack()}
        />
      }>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card style={styles.form}>
          {isRegister && (
            <Input
              label={t('auth.name')}
              required
              autoCapitalize="words"
              returnKeyType="next"
              success={name.touched && name.valid && name.value.length > 0}
              {...name.inputProps}
            />
          )}
          <Input
            label={t('auth.email')}
            required
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            success={email.touched && email.valid && email.value.length > 0}
            {...email.inputProps}
          />
          <Input
            label={t('auth.password')}
            required
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={submit}
            helper={isRegister ? t('auth.passwordHelper') : undefined}
            rightSlot={
              <IconButton
                name={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(v => !v)}
                accessibilityLabel={t(showPassword ? 'common.hidePassword' : 'common.showPassword')}
                checked={showPassword}
                color={colors.muted}
                size={20}
              />
            }
            {...password.inputProps}
          />
          <Button
            title={isRegister ? t('auth.registerCta') : t('auth.signInCta')}
            onPress={submit}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <Pressable
          onPress={() => setMode(isRegister ? 'signin' : 'register')}
          style={({ pressed }) => [styles.switch, pressed && { opacity: 0.6 }]}
          accessibilityRole="button">
          <AppText variant="caption" weight="semibold" color={colors.primary}>
            {isRegister ? t('auth.toSignIn') : t('auth.toRegister')}
          </AppText>
        </Pressable>

        <View style={styles.guestNote}>
          <AppText variant="caption" muted center>
            {t('auth.anonymousNote')}
          </AppText>
          <Button
            title={t('auth.continueAsGuest')}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg },
  form: { gap: spacing.md },
  switch: { alignItems: 'center', paddingVertical: spacing.lg },
  guestNote: { marginTop: spacing.xl, gap: spacing.sm, alignItems: 'center' },
});
