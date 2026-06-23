import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, StyleSheet, Alert } from 'react-native';
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
  Chip,
  Badge,
  Icon,
  Button,
  ProgressBar,
  useToast,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { Procedure } from '../../data/types';
import { procedureById } from '../../data/procedures';
import { institutionById } from '../../data/institutions';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { formatDate } from '../../utils/date';
import { haptics } from '../../utils/haptics';
import { goToMapFocus } from '../../navigation/cross';
import { DocumentsStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DocumentsStackParamList, 'ProcedureDetail'>;
type Rt = RouteProp<DocumentsStackParamList, 'ProcedureDetail'>;
type Tab = 'docs' | 'steps';

const in30Days = () => new Date(Date.now() + 30 * 86400000).toISOString();

/**
 * Detalji postupka sa dva taba (Dokumenti / Koraci) u istom ekranu.
 * Tabovi menjaju sadržaj lokalno — bez navigacije i bez prelaza po ekranu.
 * `initialTab` omogućava da AI akcije i prečice slete direktno na pravi tab.
 */
export function ProcedureDetailScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const { procedureId, initialTab } = useRoute<Rt>().params;
  const proc = procedureById(procedureId);

  const startProcedure = useProgressStore(s => s.startProcedure);
  const [tab, setTab] = useState<Tab>(initialTab ?? 'docs');

  // Pokreni postupak pri ulasku (idempotentno u store-u).
  useEffect(() => {
    startProcedure(procedureId);
  }, [procedureId, startProcedure]);

  // Kada navigacija eksplicitno cilja tab (npr. AI akcija) ili se promeni
  // postupak na već montiranom ekranu — sinhronizuj aktivni tab.
  useEffect(() => {
    setTab(initialTab ?? 'docs');
  }, [procedureId, initialTab]);

  if (!proc) {
    return (
      <Screen header={<Header onBack={() => navigation.goBack()} />}>
        <AppText style={{ padding: spacing.lg }}>{t('procedure.notFound')}</AppText>
      </Screen>
    );
  }

  return (
    <Screen header={<Header title={loc(proc.shortTitle ?? proc.title)} onBack={() => navigation.goBack()} />}>
      <View style={styles.segWrap}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'docs', label: t('procedure.documentsTab') },
            { value: 'steps', label: t('procedure.stepsTab') },
          ]}
        />
      </View>

      {tab === 'docs' ? (
        <DocumentsTab proc={proc} procedureId={procedureId} onGoToSteps={() => setTab('steps')} />
      ) : (
        <StepsTab proc={proc} procedureId={procedureId} />
      )}
    </Screen>
  );
}

function DocumentsTab({
  proc,
  procedureId,
  onGoToSteps,
}: {
  proc: Procedure;
  procedureId: string;
  onGoToSteps: () => void;
}) {
  const { t } = useTranslation();
  const loc = useLoc();
  const toast = useToast();
  const toggleOwned = useProgressStore(s => s.toggleDocumentOwned);
  const setDeadline = useProgressStore(s => s.setDocumentDeadline);
  const progress = useProgressStore(s => s.byProcedure[procedureId]);

  const owned = new Set(progress?.ownedDocumentIds ?? []);
  const deadlines = progress?.documentDeadlines ?? {};

  const onToggleDoc = (docId: string) => {
    const willOwn = !owned.has(docId);
    toggleOwned(procedureId, docId);
    haptics.light();
    // Milestone: sva dokumenta upravo prikupljena.
    if (willOwn && owned.size + 1 === proc.documents.length) {
      haptics.success();
      toast.show(t('documents.allCollected'), { tone: 'success' });
    }
  };

  const onDeadlinePress = (docId: string, current?: string) => {
    if (current) {
      // Uklanjanje roka traži potvrdu (sprečavanje slučajnog gubitka).
      Alert.alert(t('documents.removeDeadlineConfirm'), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setDeadline(procedureId, docId, '');
            toast.show(t('documents.deadlineRemoved'), { tone: 'info' });
          },
        },
      ]);
    } else {
      const iso = in30Days();
      setDeadline(procedureId, docId, iso);
      haptics.light();
      toast.show(t('documents.deadlineSet', { date: formatDate(iso) }), { tone: 'success' });
    }
  };

  return (
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
                onToggle={() => onToggleDoc(doc.id)}
                right={
                  !isOwned ? (
                    <Pressable
                      onPress={() => onDeadlinePress(doc.id, deadline)}
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
        <Button title={t('chat.actionStepsCta')} icon="check" onPress={onGoToSteps} />
      </View>
    </ScrollView>
  );
}

function StepsTab({ proc, procedureId }: { proc: Procedure; procedureId: string }) {
  const { t } = useTranslation();
  const loc = useLoc();
  const toast = useToast();
  const navigation = useNavigation<Nav>();
  const toggleStep = useProgressStore(s => s.toggleStepCompleted);
  const progress = useProgressStore(s => s.byProcedure[procedureId]);

  const done = new Set(progress?.completedStepIds ?? []);
  const completedCount = proc.steps.filter(s => done.has(s.id)).length;
  const percent = proc.steps.length > 0
    ? Math.round((completedCount / proc.steps.length) * 100)
    : 0;

  const onToggleStep = (stepId: string) => {
    const willComplete = !done.has(stepId);
    toggleStep(procedureId, stepId);
    haptics.light();
    // Milestone: poslednji korak upravo završen.
    if (willComplete && completedCount + 1 === proc.steps.length) {
      haptics.success();
      toast.show(t('procedure.allStepsDone'), { tone: 'success' });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Card soft style={{ marginBottom: spacing.lg }}>
        <View style={styles.progressHead}>
          <AppText variant="label">
            {t('procedure.progress', { current: completedCount, total: proc.steps.length })}
          </AppText>
          <AppText variant="caption" weight="semibold" color={colors.primary}>
            {percent}%
          </AppText>
        </View>
        <ProgressBar percent={percent} />
      </Card>

      {proc.steps.map((step, i) => {
        const isDone = done.has(step.id);
        const isLast = i === proc.steps.length - 1;
        const inst = step.institutionId ? institutionById(step.institutionId) : undefined;
        return (
          <View key={step.id} style={styles.stepRow}>
            {/* Rail */}
            <View style={styles.rail}>
              <Pressable
                onPress={() => onToggleStep(step.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={`${t('procedure.stepsTab')} ${i + 1}: ${step.title}`}
                style={[styles.dot, isDone && styles.dotDone]}>
                {isDone ? (
                  <Icon name="check" size={14} color={colors.white} strokeWidth={2.5} />
                ) : (
                  <AppText variant="caption" weight="bold" color={colors.primary}>
                    {i + 1}
                  </AppText>
                )}
              </Pressable>
              {!isLast && <View style={[styles.line, isDone && styles.lineDone]} />}
            </View>

            {/* Body */}
            <Pressable
              style={styles.stepBody}
              onPress={() => onToggleStep(step.id)}>
              <AppText
                variant="label"
                color={isDone ? colors.muted : colors.ink}
                style={isDone ? styles.strike : undefined}>
                {loc(step.title)}
              </AppText>
              <AppText variant="caption" muted style={{ marginTop: 2 }}>
                {loc(step.description)}
              </AppText>
              <View style={styles.chips}>
                {step.chips?.map(c => (
                  <Chip key={c} label={loc(c)} tone="neutral" />
                ))}
              </View>
              {inst && (
                <Pressable
                  onPress={() => goToMapFocus(navigation as any, inst.id)}
                  accessibilityRole="button"
                  style={styles.instLink}>
                  <Icon name="map-pin" size={14} color={colors.primary} />
                  <AppText variant="caption" weight="semibold" color={colors.primary}>
                    {loc(inst.shortName ?? inst.name)} · {t('procedure.openOnMap')}
                  </AppText>
                </Pressable>
              )}
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  segWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  scroll: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xxl },
  // Dokumenti
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
  // Koraci
  progressHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 32 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primarySoft2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
  lineDone: { backgroundColor: colors.success },
  stepBody: { flex: 1, paddingBottom: spacing.xl },
  strike: { textDecorationLine: 'line-through' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  instLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.sm },
});
