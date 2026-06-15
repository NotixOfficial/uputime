import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Button, Input } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Auth'>;
type Rt = RouteProp<ProfileStackParamList, 'Auth'>;

export function AuthScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const initialMode = useRoute<Rt>().params?.mode ?? 'signin';
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);

  const signIn = useAuthStore(s => s.signIn);
  const register = useAuthStore(s => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';
  const valid = email.includes('@') && password.length >= 4 && (!isRegister || name.trim().length > 0);

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    if (isRegister) await register(name.trim(), email.trim(), password);
    else await signIn(email.trim(), password);
    setLoading(false);
    navigation.goBack();
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
            <Input label={t('auth.name')} value={name} onChangeText={setName} autoCapitalize="words" />
          )}
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={isRegister ? t('auth.registerCta') : t('auth.signInCta')}
            onPress={submit}
            disabled={!valid}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />
        </Card>

        <Pressable
          onPress={() => setMode(isRegister ? 'signin' : 'register')}
          style={styles.switch}
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
