import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Button, Badge, Icon } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { institutionById } from '../../data/institutions';
import { getOpenStatus, workingHoursRows, jsToAppDay } from '../../utils/hours';
import { openDirections, callPhone, openWebsite } from '../../services/deeplink';
import { iconForInstitutionType } from '../../utils/icons';
import { useLoc } from '../../i18n/useLoc';
import { MapStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MapStackParamList, 'InstitutionDetail'>;
type Rt = RouteProp<MapStackParamList, 'InstitutionDetail'>;

export function InstitutionDetailScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const { institutionId } = useRoute<Rt>().params;
  const inst = institutionById(institutionId);

  if (!inst) {
    return (
      <Screen header={<Header onBack={() => navigation.goBack()} />}>
        <AppText style={{ padding: spacing.lg }}>{t('map.notFound')}</AppText>
      </Screen>
    );
  }

  const status = getOpenStatus(inst.workingHours);
  const todayIdx = jsToAppDay(new Date().getDay());
  const rows = workingHoursRows(inst.workingHours);

  return (
    <Screen header={<Header title={t('map.detailTitle')} onBack={() => navigation.goBack()} />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Zaglavlje */}
        <View style={styles.head}>
          <View style={styles.icon}>
            <Icon name={iconForInstitutionType(inst.type)} size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="title">{loc(inst.name)}</AppText>
            <AppText variant="body" muted style={{ marginTop: 2 }}>
              {loc(inst.address)}, {loc(inst.city)}
            </AppText>
            <View style={{ marginTop: spacing.sm }}>
              <Badge
                label={
                  status.openNow
                    ? `${t('map.openNow')}${status.closesAt ? ` · ${t('map.closesAt', { time: status.closesAt })}` : ''}`
                    : status.opensAt
                      ? `${t('map.closedNow')} · ${t('map.opensAt', { time: status.opensAt })}`
                      : t('map.closedNow')
                }
                tone={status.openNow ? 'success' : 'neutral'}
              />
            </View>
          </View>
        </View>

        {inst.note && (
          <Card soft style={{ marginBottom: spacing.lg }}>
            <AppText variant="body">{loc(inst.note)}</AppText>
          </Card>
        )}

        {/* Akcije (FZ-07) */}
        <View style={styles.actions}>
          <Button
            title={t('map.navigate')}
            icon="navigation"
            onPress={() => openDirections(inst.latitude, inst.longitude, inst.name)}
            style={{ flex: 1 }}
          />
          {inst.phone && (
            <Button
              title={t('map.call')}
              icon="phone"
              variant="secondary"
              onPress={() => callPhone(inst.phone!)}
              style={{ flex: 1 }}
            />
          )}
        </View>

        {/* Radno vreme */}
        <AppText variant="subtitle" style={{ marginBottom: spacing.sm }}>
          {t('map.workingHours')}
        </AppText>
        <Card padded={false}>
          {rows.map((row, i) => (
            <View
              key={row.day}
              style={[
                styles.hoursRow,
                i > 0 && styles.hoursBorder,
                row.day === todayIdx && styles.hoursToday,
              ]}>
              <AppText
                variant="body"
                weight={row.day === todayIdx ? 'semibold' : 'regular'}
                color={row.day === todayIdx ? colors.ink : colors.ink2}>
                {t(`map.days.${row.day}`)}
              </AppText>
              <AppText variant="body" muted={!row.label} color={row.label ? colors.ink2 : colors.muted}>
                {row.label ?? t('map.closed')}
              </AppText>
            </View>
          ))}
        </Card>

        {inst.website && (
          <View style={{ marginTop: spacing.lg }}>
            <Button
              title={t('map.website')}
              icon="globe"
              variant="ghost"
              onPress={() => openWebsite(inst.website!)}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  head: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  icon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  hoursBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  hoursToday: { backgroundColor: colors.primarySoft },
});
