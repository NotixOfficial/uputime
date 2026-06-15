import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, Card, ListRow, Button, EmptyState } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { formatDate } from '../../utils/date';
import { goToConversation } from '../../navigation/cross';
import { ProfileStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'History'>;

export function HistoryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const isAuth = useAuthStore(s => s.isAuthenticated);
  const conversations = useChatStore(s => s.conversations);
  const setCurrent = useChatStore(s => s.setCurrent);

  const open = (id: string) => {
    setCurrent(id);
    goToConversation(navigation as any);
  };

  return (
    <Screen header={<Header title={t('history.title')} onBack={() => navigation.goBack()} />}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {!isAuth ? (
          <View style={styles.locked}>
            <EmptyState icon="lock" title={t('history.guestLocked')} />
            <Button
              title={t('profile.signIn')}
              onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
            />
          </View>
        ) : conversations.length === 0 ? (
          <EmptyState icon="message" title={t('history.empty')} />
        ) : (
          <Card padded={false}>
            {conversations.map((c, i) => (
              <View key={c.id}>
                {i > 0 && <View style={styles.sep} />}
                <ListRow
                  icon="message"
                  title={c.title}
                  subtitle={formatDate(c.updatedAt)}
                  onPress={() => open(c.id)}
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
  scroll: { padding: spacing.lg },
  locked: { gap: spacing.md },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg + 40 + spacing.md },
});
