import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Card, ListRow, Chip, Icon } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { INSTITUTIONS } from '../../data/institutions';
import { InstitutionType } from '../../data/types';
import { iconForInstitutionType } from '../../utils/icons';
import { getOpenStatus } from '../../utils/hours';
import { useLoc } from '../../i18n/useLoc';
import { MapStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<MapStackParamList, 'MapHome'>;
type Rt = RouteProp<MapStackParamList, 'MapHome'>;

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

export function MapHomeScreen() {
  const { t } = useTranslation();
  const loc = useLoc();
  const navigation = useNavigation<Nav>();
  const focusParams = useRoute<Rt>().params;
  const focusId = focusParams?.focusInstitutionId;
  const focusNonce = focusParams?.focusNonce;
  const [filter, setFilter] = useState<InstitutionType | 'all'>('all');
  const mapRef = useRef<any>(null);

  const institutions = useMemo(
    () => (filter === 'all' ? INSTITUTIONS : INSTITUTIONS.filter(i => i.type === filter)),
    [filter],
  );

  // Cross-tok: centriraj mapu na traženu instituciju.
  useEffect(() => {
    if (!focusId) return;
    const inst = INSTITUTIONS.find(i => i.id === focusId);
    if (inst && mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        { latitude: inst.latitude, longitude: inst.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        600,
      );
    }
  }, [focusId, focusNonce]);

  const MapView = Maps?.default;
  const Marker = Maps?.Marker;

  return (
    <Screen header={<Header title={t('map.title')} />}>
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
        {MapView ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={NS_REGION}
            showsUserLocation
            accessibilityLabel={t('map.title')}>
            {institutions.map((inst: any) =>
              Marker ? (
                <Marker
                  key={inst.id}
                  coordinate={{ latitude: inst.latitude, longitude: inst.longitude }}
                  title={loc(inst.name)}
                  description={loc(inst.address)}
                  onCalloutPress={() =>
                    navigation.navigate('InstitutionDetail', { institutionId: inst.id })
                  }
                />
              ) : null,
            )}
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
            {institutions.map((inst, i) => {
              const status = getOpenStatus(inst.workingHours);
              return (
                <View key={inst.id}>
                  {i > 0 && <View style={styles.sep} />}
                  <ListRow
                    icon={iconForInstitutionType(inst.type)}
                    title={loc(inst.name)}
                    subtitle={`${loc(inst.address)} · ${loc(inst.city)}`}
                    accessibilityLabel={`${loc(inst.name)}, ${
                      status.openNow ? t('map.openNow') : t('map.closedNow')
                    }`}
                    onPress={() =>
                      navigation.navigate('InstitutionDetail', { institutionId: inst.id })
                    }
                    right={
                      <View
                        accessibilityElementsHidden
                        importantForAccessibility="no-hide-descendants"
                        style={[
                          styles.statusDot,
                          { backgroundColor: status.openNow ? colors.success : colors.muted2 },
                        ]}
                      />
                    }
                  />
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
