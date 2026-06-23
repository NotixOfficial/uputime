import React from 'react';
import { View, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  AppText,
  Card,
  Composer,
  Icon,
  SectionHeader,
  ProgressBar,
  ListRow,
  Badge,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { SUGGESTIONS, procedureBySlug, procedureById } from '../../data/procedures';
import { useChatStore } from '../../store/useChatStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { iconForCategory } from '../../utils/icons';
import { goToProcedureSteps } from '../../navigation/cross';
import { AskStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AskStackParamList, 'ChatHome'>;

export function ChatHomeScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const newConversation = useChatStore(s => s.newConversation);
  const ask = useChatStore(s => s.ask);
  const askProcedure = useChatStore(s => s.askProcedure);
  const byProcedure = useProgressStore(s => s.byProcedure);

  const active = Object.values(byProcedure).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  const startQuery = (query: string) => {
    newConversation();
    navigation.navigate('Conversation');
    ask(query);
  };

  // Predlog sa home ekrana: korisnik je već izabrao postupak, pa idemo
  // direktno na taj postupak (bez nuđenja izbora) i šaljemo odgovor.
  const startSuggestion = (procedureSlug: string, label: string) => {
    newConversation();
    navigation.navigate('Conversation');
    askProcedure(procedureSlug, label);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Naslov */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText variant="eyebrow">{t('ask.eyebrow')}</AppText>
            <AppText variant="h1" style={{ marginTop: 4 }}>
              {t('ask.title')}
            </AppText>
            <AppText variant="body" muted style={{ marginTop: spacing.xs }}>
              {t('ask.subtitle')}
            </AppText>
          </View>
          <View style={styles.logo}>
            <Icon name="compass" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Popularno */}
        <SectionHeader title={t('ask.popular')} />
        <View style={styles.grid}>
          {SUGGESTIONS.map(s => {
            const proc = procedureBySlug(s.procedureSlug);
            return (
              <Pressable
                key={s.procedureSlug}
                onPress={() => startSuggestion(s.procedureSlug, loc(s.label))}
                accessibilityRole="button"
                accessibilityLabel={loc(s.label)}
                style={({ pressed }) => [styles.suggest, pressed && styles.pressed]}>
                <View style={styles.suggestIcon}>
                  <Icon
                    name={proc ? iconForCategory(proc.category) : 'file-text'}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <AppText variant="label" numberOfLines={2}>
                  {loc(s.label)}
                </AppText>
                <AppText variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>
                  {loc(s.meta)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Postupci u toku */}
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={t('ask.inProgress')} />
          {active.length === 0 ? (
            <Card soft>
              <AppText variant="body" muted center>
                {t('ask.noInProgress')}
              </AppText>
            </Card>
          ) : (
            <Card padded={false}>
              {active.map((p, i) => {
                const proc = procedureById(p.procedureId);
                if (!proc) return null;
                const done = p.completedStepIds.length;
                const total = proc.steps.length;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <View key={p.procedureId}>
                    {i > 0 && <View style={styles.sep} />}
                    <ListRow
                      icon={iconForCategory(proc.category)}
                      title={loc(proc.title)}
                      subtitle={t('ask.doneOf', { done, total, percent })}
                      onPress={() => goToProcedureSteps(navigation as any, proc.id)}
                      right={
                        percent === 100 ? <Badge label="100%" tone="success" /> : undefined
                      }
                    />
                    <View style={styles.progressWrap}>
                      <ProgressBar percent={percent} />
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>

      <Composer placeholder={t('ask.composerPlaceholder')} onSend={startQuery} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xl, gap: spacing.md },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  suggest: {
    width: '47.5%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  pressed: { opacity: 0.85 },
  suggestIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
  progressWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, marginTop: -spacing.xs },
});
