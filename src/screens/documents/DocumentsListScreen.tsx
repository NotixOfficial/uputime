import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  Header,
  AppText,
  Card,
  ListRow,
  SectionHeader,
  ProgressBar,
  Badge,
  EmptyState,
} from '../../components';
import { colors, spacing } from '../../theme';
import { PROCEDURES, procedureById } from '../../data/procedures';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { iconForCategory } from '../../utils/icons';
import { DocumentsStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DocumentsStackParamList, 'DocumentsList'>;

export function DocumentsListScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const byProcedure = useProgressStore(s => s.byProcedure);
  const started = Object.values(byProcedure).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const startedIds = new Set(started.map(p => p.procedureId));

  return (
    <Screen header={<Header title={t('documents.title')} />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText variant="body" muted style={{ marginBottom: spacing.lg }}>
          {t('documents.subtitle')}
        </AppText>

        {started.length > 0 && (
          <View style={{ marginBottom: spacing.xl }}>
            <SectionHeader title={t('documents.inProgressLabel')} />
            <Card padded={false}>
              {started.map((p, i) => {
                const proc = procedureById(p.procedureId);
                if (!proc) return null;
                const owned = p.ownedDocumentIds.length;
                const total = proc.documents.length;
                const percent = total > 0 ? Math.round((owned / total) * 100) : 0;
                return (
                  <View key={p.procedureId}>
                    {i > 0 && <View style={styles.sep} />}
                    <ListRow
                      icon={iconForCategory(proc.category)}
                      title={loc(proc.title)}
                      subtitle={t('documents.ownedOf', { owned, total })}
                      onPress={() =>
                        navigation.navigate('ProcedureDetail', { procedureId: proc.id })
                      }
                      right={
                        owned === total ? (
                          <Badge label={t('common.done')} tone="success" />
                        ) : undefined
                      }
                    />
                    <View style={styles.progressWrap}>
                      <ProgressBar percent={percent} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </View>
        )}

        <SectionHeader title={t('documents.allProcedures')} />
        <Card padded={false}>
          {PROCEDURES.map((proc, i) => (
            <View key={proc.id}>
              {i > 0 && <View style={styles.sep} />}
              <ListRow
                icon={iconForCategory(proc.category)}
                iconColor={startedIds.has(proc.id) ? colors.muted2 : colors.primary}
                iconBg={colors.primarySoft}
                title={loc(proc.title)}
                subtitle={t('ask.stepsDocsMeta', {
                  steps: proc.steps.length,
                  docs: proc.documents.length,
                })}
                onPress={() =>
                  navigation.navigate('ProcedureDetail', { procedureId: proc.id })
                }
              />
            </View>
          ))}
        </Card>

        {started.length === 0 && PROCEDURES.length === 0 && (
          <EmptyState icon="documents" title={t('documents.empty')} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
  progressWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, marginTop: -spacing.xs },
});
