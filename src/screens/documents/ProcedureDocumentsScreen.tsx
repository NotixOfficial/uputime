import React, { useEffect } from 'react';
import { ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  Header,
  AppText,
  Card,
  CheckRow,
  Segmented,
  Badge,
  Icon,
  Button,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { procedureById } from '../../data/procedures';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { formatDate } from '../../utils/date';
import { DocumentsStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DocumentsStackParamList, 'ProcedureDocuments'>;
type Rt = RouteProp<DocumentsStackParamList, 'ProcedureDocuments'>;

const in30Days = () => new Date(Date.now() + 30 * 86400000).toISOString();

export function ProcedureDocumentsScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const { procedureId } = useRoute<Rt>().params;
  const proc = procedureById(procedureId);

  const startProcedure = useProgressStore(s => s.startProcedure);
  const toggleOwned = useProgressStore(s => s.toggleDocumentOwned);
  const setDeadline = useProgressStore(s => s.setDocumentDeadline);
  const progress = useProgressStore(s => s.byProcedure[procedureId]);

  useEffect(() => {
    startProcedure(procedureId);
  }, [procedureId, startProcedure]);

  if (!proc) {
    return (
      <Screen header={<Header onBack={() => navigation.goBack()} />}>
        <AppText style={{ padding: spacing.lg }}>{t('procedure.notFound')}</AppText>
      </Screen>
    );
  }

  const owned = new Set(progress?.ownedDocumentIds ?? []);
  const deadlines = progress?.documentDeadlines ?? {};

  return (
    <Screen header={<Header title={loc(proc.shortTitle ?? proc.title)} onBack={() => navigation.goBack()} />}>
      <View style={styles.segWrap}>
        <Segmented
          value="docs"
          onChange={v => v === 'steps' && navigation.navigate('ProcedureSteps', { procedureId })}
          options={[
            { value: 'docs', label: t('procedure.documentsTab') },
            { value: 'steps', label: t('procedure.stepsTab') },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card soft style={{ marginBottom: spacing.lg }}>
          <AppText variant="body">{loc(proc.summary)}</AppText>
          <View style={styles.metaRow}>
            <Icon name="globe" size={13} color={colors.muted} />
            <AppText variant="caption" muted style={{ flex: 1 }}>
              {t('procedure.source')}: {proc.source} · {t('procedure.updated', { date: formatDate(proc.updatedAt) })}
            </AppText>
          </View>
          {proc.estimatedCost && (
            <Badge label={t('procedure.estimatedCost', { cost: proc.estimatedCost })} tone="primary" />
          )}
        </Card>

        <Card padded={false}>
          {proc.documents.map((doc, i) => {
            const isOwned = owned.has(doc.id);
            const deadline = deadlines[doc.id];
            return (
              <View key={doc.id}>
                {i > 0 && <View style={styles.sep} />}
                <CheckRow
                  checked={isOwned}
                  title={loc(doc.title)}
                  subtitle={loc(doc.description)}
                  onToggle={() => toggleOwned(procedureId, doc.id)}
                  right={
                    !isOwned ? (
                      <Pressable
                        onPress={() => setDeadline(procedureId, doc.id, deadline ? '' : in30Days())}
                        accessibilityRole="button"
                        accessibilityLabel={t('documents.setDeadline')}>
                        {deadline ? (
                          <Badge label={formatDate(deadline)} tone="warn" />
                        ) : (
                          <View style={styles.deadlineChip}>
                            <Icon name="clock" size={13} color={colors.muted} />
                            <AppText variant="caption" muted>
                              {t('documents.setDeadline')}
                            </AppText>
                          </View>
                        )}
                      </Pressable>
                    ) : doc.cost ? (
                      <Badge label={doc.cost} tone="neutral" />
                    ) : undefined
                  }
                />
              </View>
            );
          })}
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <Button
            title={t('chat.actionStepsCta')}
            icon="check"
            onPress={() => navigation.navigate('ProcedureSteps', { procedureId })}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  scroll: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xxl },
  metaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: spacing.sm, marginBottom: spacing.sm },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  deadlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
