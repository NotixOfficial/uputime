import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, Chip, Icon, Input } from '../../components';
import { colors, radius, spacing, HIT_TARGET } from '../../theme';
import { INSTITUTIONS } from '../../data/institutions';
import { Institution, InstitutionType } from '../../data/types';
import { iconForInstitutionType } from '../../utils/icons';
import { getOpenStatus } from '../../utils/hours';
import { haptics } from '../../utils/haptics';
import { useLoc } from '../../i18n/useLoc';
import { MapStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MapStackParamList, 'MapHome'>;
type Rt = RouteProp<MapStackParamList, 'MapHome'>;
type Loc = ReturnType<typeof useLoc>;
type T = ReturnType<typeof useTranslation>['t'];

// Lenjo učitavanje native mape: ako modul nije linkovan, padamo na listu.
let Maps: any = null;
try {
  Maps = require('react-native-maps');
} catch {
  Maps = null;
}

const NS_REGION = {
  latitude: 45.2517,
  longitude: 19.8369,
  latitudeDelta: 0.07,
  longitudeDelta: 0.07,
};

const TYPE_FILTERS: (InstitutionType | 'all')[] = [
  'all', 'mup', 'opstina', 'apr', 'poreska', 'sud', 'maticar', 'komunalno', 'obrazovanje',
];

// Veličina avatara reda; deli je i razdvojna linija da ostane poravnata s tekstom.
const ICON_SIZE = 40;

// Mapiranje srpskih dijakritika na osnovna slova (latinica + ćirilica),
// da „salter" pronađe „Šalter" bez obzira na precizno kucanje.
const FOLD: Record<string, string> = {
  š: 's', č: 'c', ć: 'c', ž: 'z', đ: 'd',
  ш: 's', ч: 'c', ћ: 'c', ж: 'z', ђ: 'd',
};

// Normalizacija za pretragu: mala slova bez dijakritika.
const norm = (s: string) => s.toLowerCase().replace(/[ščćžđшчћжђ]/g, m => FOLD[m] ?? m);

/**
 * Red u listi institucija sa podeljenim dodirom:
 *  - glavni deo (≈80%) selektuje pin na mapi,
 *  - desni „info" taster otvara detalje institucije.
 * Kad mapa nije dostupna, ceo red otvara detalje (nema šta da se selektuje).
 */
function InstitutionRow({
  inst,
  loc,
  t,
  selected,
  hasMap,
  onSelect,
  onOpenDetail,
}: {
  inst: Institution;
  loc: Loc;
  t: T;
  selected: boolean;
  hasMap: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
}) {
  const status = getOpenStatus(inst.workingHours);
  const statusLabel = status.openNow ? t('map.openNow') : t('map.closedNow');
  return (
    <Pressable
      onPress={hasMap ? onSelect : onOpenDetail}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={
        hasMap
          ? `${loc(inst.name)}, ${statusLabel}. ${t('map.showOnMapA11y')}`
          : `${loc(inst.name)}, ${statusLabel}`
      }
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.rowPressed,
      ]}>
      <View style={[styles.icon, { backgroundColor: selected ? colors.surface : colors.primarySoft }]}>
        <Icon name={iconForInstitutionType(inst.type)} size={20} color={colors.primary} />
      </View>
      <View style={styles.main}>
        <AppText variant="label" numberOfLines={1}>
          {loc(inst.name)}
        </AppText>
        <AppText variant="caption" muted numberOfLines={2} style={{ marginTop: 2 }}>
          {loc(inst.address)} · {loc(inst.city)}
        </AppText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.statusDot,
          { backgroundColor: status.openNow ? colors.success : colors.muted2 },
        ]}
      />
      {hasMap ? (
        <Pressable
          onPress={onOpenDetail}
          accessibilityRole="button"
          accessibilityLabel={`${loc(inst.name)}: ${t('map.moreInfoA11y')}`}
          hitSlop={6}
          style={({ pressed }) => [styles.infoBtn, pressed && styles.infoBtnPressed]}>
          <Icon name="info" size={20} color={colors.muted} />
        </Pressable>
      ) : (
        <Icon name="chevron-right" size={20} color={colors.muted2} />
      )}
    </Pressable>
  );
}

export function MapHomeScreen() {
  const { t, i18n } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const focusParams = useRoute<Rt>().params;
  const focusId = focusParams?.focusInstitutionId;
  const focusNonce = focusParams?.focusNonce;
  const [filter, setFilter] = useState<InstitutionType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<Record<string, any>>({});
  const calloutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const institutions = useMemo(() => {
    const byType = filter === 'all' ? INSTITUTIONS : INSTITUTIONS.filter(i => i.type === filter);
    const q = norm(query.trim());
    if (!q) return byType;
    return byType.filter(i =>
      norm(`${loc(i.name)} ${loc(i.address)} ${loc(i.city)}`).includes(q),
    );
    // loc zavisi samo od jezika; key-ujemo na i18n.language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query, i18n.language]);

  const MapView = Maps?.default;
  const Marker = Maps?.Marker;
  const Callout = Maps?.Callout;
  const hasMap = !!MapView;

  const openDetail = useCallback(
    (id: string) => navigation.navigate('InstitutionDetail', { institutionId: id }),
    [navigation],
  );

  // Selektuje instituciju: centrira mapu, ističe pin i otvara callout.
  const selectInstitution = useCallback((inst: Institution) => {
    setSelectedId(inst.id);
    haptics.light();
    mapRef.current?.animateToRegion?.(
      { latitude: inst.latitude, longitude: inst.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      500,
    );
    // Callout se prikazuje tek pošto se mapa pomeri i marker iscrta.
    if (calloutTimer.current) clearTimeout(calloutTimer.current);
    calloutTimer.current = setTimeout(() => {
      markerRefs.current[inst.id]?.showCallout?.();
    }, 450);
  }, []);

  // Cross-tok: fokus iz drugog taba (postupak/chat) → selektuj traženi pin.
  useEffect(() => {
    if (!focusId) return;
    const inst = INSTITUTIONS.find(i => i.id === focusId);
    if (!inst) return;
    // Ako je trenutni filter ili pretraga sakrila instituciju, resetuj ih.
    if (filter !== 'all' && inst.type !== filter) setFilter('all');
    setQuery('');
    selectInstitution(inst);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, focusNonce]);

  // Očisti zakazani callout pri napuštanju ekrana.
  useEffect(() => () => {
    if (calloutTimer.current) clearTimeout(calloutTimer.current);
  }, []);

  return (
    <Screen header={<Header title={t('map.title')} />}>
      {/* Pretraga */}
      <View style={styles.searchWrap}>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={t('map.searchPlaceholder')}
          accessibilityLabel={t('map.searchPlaceholder')}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
          leftSlot={<Icon name="search" size={18} color={colors.muted} />}
          rightSlot={
            query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityRole="button"
                accessibilityLabel={t('map.searchClear')}
                hitSlop={8}>
                <Icon name="x" size={18} color={colors.muted} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {/* Filteri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filters}>
        {TYPE_FILTERS.map(type => (
          <Chip
            key={type}
            label={type === 'all' ? t('map.filterAll') : t(`map.types.${type}`)}
            selected={filter === type}
            onPress={() => setFilter(type)}
          />
        ))}
      </ScrollView>

      {/* Mapa ili fallback */}
      <View style={styles.mapWrap}>
        {hasMap ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={NS_REGION}
            showsUserLocation
            accessibilityLabel={t('map.title')}>
            {institutions.map((inst: Institution) => {
              if (!Marker) return null;
              const isSel = inst.id === selectedId;
              return (
                <Marker
                  key={inst.id}
                  ref={(r: any) => {
                    markerRefs.current[inst.id] = r;
                  }}
                  coordinate={{ latitude: inst.latitude, longitude: inst.longitude }}
                  pinColor={isSel ? colors.primary : undefined}
                  zIndex={isSel ? 1 : 0}
                  title={loc(inst.name)}
                  description={loc(inst.address)}
                  onPress={() => selectInstitution(inst)}
                  onCalloutPress={() => openDetail(inst.id)}>
                  {Callout ? (
                    <Callout>
                      <View style={styles.callout}>
                        <AppText variant="label" numberOfLines={2}>
                          {loc(inst.name)}
                        </AppText>
                        <AppText variant="caption" muted numberOfLines={2} style={{ marginTop: 2 }}>
                          {loc(inst.address)}
                        </AppText>
                        <View style={styles.calloutMore}>
                          <AppText variant="caption" weight="semibold" color={colors.primary}>
                            {t('map.viewMore')}
                          </AppText>
                          <Icon name="chevron-right" size={14} color={colors.primary} />
                        </View>
                      </View>
                    </Callout>
                  ) : null}
                </Marker>
              );
            })}
          </MapView>
        ) : (
          <View style={styles.placeholder}>
            <Icon name="map" size={32} color={colors.muted2} />
            <AppText variant="caption" muted center style={{ marginTop: spacing.sm }}>
              {t('map.fallbackTitle')}{'\n'}{t('map.fallbackBody')}
            </AppText>
          </View>
        )}
      </View>

      {/* Lista institucija */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {institutions.length === 0 ? (
          <AppText variant="body" muted center style={{ padding: spacing.lg }}>
            {t('map.noResults')}
          </AppText>
        ) : (
          <Card padded={false}>
            {institutions.map((inst, i) => (
              <View key={inst.id}>
                {i > 0 && <View style={styles.sep} />}
                <InstitutionRow
                  inst={inst}
                  loc={loc}
                  t={t}
                  selected={inst.id === selectedId}
                  hasMap={hasMap}
                  onSelect={() => selectInstitution(inst)}
                  onOpenDetail={() => openDetail(inst.id)}
                />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  filterBar: { flexGrow: 0, flexShrink: 0 },
  filters: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  mapWrap: {
    height: 240,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  list: { flex: 1, marginTop: spacing.md },
  listContent: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xxl },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + ICON_SIZE + spacing.md },

  // Red institucije
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: HIT_TARGET + 12,
  },
  rowSelected: { backgroundColor: colors.primarySoft },
  rowPressed: { backgroundColor: colors.surface2 },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1, minWidth: 0 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  infoBtn: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    paddingHorizontal: spacing.md,
    marginVertical: -spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  infoBtnPressed: { backgroundColor: colors.surface2, opacity: 0.7 },

  // Callout na mapi
  callout: { width: 208, paddingVertical: spacing.xs },
  calloutMore: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: spacing.sm },
});
