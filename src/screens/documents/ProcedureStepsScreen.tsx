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
  Segmented,
  Chip,
  Icon,
  ProgressBar,
} from '../../components';
import { colors, radius, spacing } from '../../theme';
import { procedureById } from '../../data/procedures';
import { institutionById } from '../../data/institutions';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { goToMapFocus } from '../../navigation/cross';
import { DocumentsStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<DocumentsStackParamList, 'ProcedureSteps'>;
type Rt = RouteProp<DocumentsStackParamList, 'ProcedureSteps'>;

export function ProcedureStepsScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const { procedureId } = useRoute<Rt>().params;
  const proc = procedureById(procedureId);

  const startProcedure = useProgressStore(s => s.startProcedure);
  const toggleStep = useProgressStore(s => s.toggleStepCompleted);
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

  const done = new Set(progress?.completedStepIds ?? []);
  const completedCount = proc.steps.filter(s => done.has(s.id)).length;
  const percent = proc.steps.length > 0
    ? Math.round((completedCount / proc.steps.length) * 100)
    : 0;

  return (
    <Screen header={<Header title={loc(proc.shortTitle ?? proc.title)} onBack={() => navigation.goBack()} />}>
      <View style={styles.segWrap}>
        <Segmented
          value="steps"
          onChange={v => v === 'docs' && navigation.navigate('ProcedureDocuments', { procedureId })}
          options={[
            { value: 'docs', label: t('procedure.documentsTab') },
            { value: 'steps', label: t('procedure.stepsTab') },
          ]}
        />
      </View>

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
                  onPress={() => toggleStep(procedureId, step.id)}
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
                onPress={() => toggleStep(procedureId, step.id)}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  segWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  scroll: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.xxl },
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
