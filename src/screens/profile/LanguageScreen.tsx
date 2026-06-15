import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, ListRow, Icon } from '../../components';
import { colors, spacing } from '../../theme';
import { LANGUAGES, AppLanguage } from '../../i18n';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Language'>;

export function LanguageScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);

  const select = (code: AppLanguage) => setLanguage(code);

  return (
    <Screen header={<Header title={t('language.title')} onBack={() => navigation.goBack()} />}>
      <View style={styles.content}>
        <AppText variant="body" muted style={{ marginBottom: spacing.lg }}>
          {t('language.subtitle')}
        </AppText>
        <Card padded={false}>
          {LANGUAGES.map((l, i) => (
            <View key={l.code}>
              {i > 0 && <View style={styles.sep} />}
              <ListRow
                title={t(l.labelKey)}
                onPress={() => select(l.code)}
                showChevron={false}
                right={
                  language === l.code ? (
                    <Icon name="check" size={20} color={colors.primary} strokeWidth={2.5} />
                  ) : undefined
                }
              />
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
});
