import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen, Header, AppText, Icon, Composer } from '../../components';
import { colors, radius, spacing, HIT_TARGET } from '../../theme';
import { useChatStore } from '../../store/useChatStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useLoc } from '../../i18n/useLoc';
import { formatDate } from '../../utils/date';
import { procedureBySlug } from '../../data/procedures';
import { ActionCard, ChatMessage } from '../../data/types';
import {
  goToProcedureDocuments,
  goToProcedureSteps,
  goToMapFocus,
  goToNewReminder,
} from '../../navigation/cross';
import { AskStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<AskStackParamList, 'Conversation'>;

export function ConversationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const conversation = useChatStore(s =>
    s.conversations.find(c => c.id === s.currentId),
  );
  const sending = useChatStore(s => s.sending);
  const ask = useChatStore(s => s.ask);
  const startProcedure = useProgressStore(s => s.startProcedure);
  const scrollRef = useRef<ScrollView>(null);

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(id);
  }, [messages.length, sending]);

  const onAction = (action: ActionCard) => {
    switch (action.kind) {
      case 'documents': {
        const proc = procedureBySlug(action.procedureSlug);
        if (proc) {
          startProcedure(proc.id);
          goToProcedureDocuments(navigation as any, proc.id);
        }
        break;
      }
      case 'steps': {
        const proc = procedureBySlug(action.procedureSlug);
        if (proc) {
          startProcedure(proc.id);
          goToProcedureSteps(navigation as any, proc.id);
        }
        break;
      }
      case 'map':
        goToMapFocus(navigation as any, action.institutionId);
        break;
      case 'reminder':
        goToNewReminder(navigation as any, action.documentType);
        break;
    }
  };

  return (
    <Screen header={<Header title={t('chat.title')} onBack={() => navigation.goBack()} />}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {messages.map(m => (
            <MessageBubble key={m.id} message={m} onAction={onAction} />
          ))}
          {sending && (
            <View style={styles.thinking}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText variant="caption" muted>
                {t('chat.thinking')}
              </AppText>
            </View>
          )}
        </ScrollView>
        <Composer
          placeholder={t('chat.composerPlaceholder')}
          onSend={ask}
          disabled={sending}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function MessageBubble({
  message,
  onAction,
}: {
  message: ChatMessage;
  onAction: (a: ActionCard) => void;
}) {
  const { t } = useTranslation();
  const loc = useLoc();
  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <AppText color={colors.white}>{message.text}</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiWrap}>
      <View style={styles.aiBubble}>
        <AppText variant="body" color={colors.ink}>
          {loc(message.text)}
        </AppText>

        {message.stale && (
          <View style={styles.staleRow}>
            <Icon name="info" size={14} color={colors.accentInk} />
            <AppText variant="caption" color={colors.accentInk} style={styles.flex}>
              {t('chat.stale')}
            </AppText>
          </View>
        )}

        {message.source && (
          <View style={styles.sourceRow}>
            <Icon name="globe" size={12} color={colors.muted} />
            <AppText variant="caption" muted style={styles.flex}>
              {t('chat.sourcePrefix')}: {message.source}
              {message.sourceDate
                ? ` · ${t('chat.updatedPrefix')} ${formatDate(message.sourceDate)}`
                : ''}
            </AppText>
          </View>
        )}
      </View>

      {message.actions?.map((action, i) => (
        <ActionCardView key={i} action={action} onPress={() => onAction(action)} />
      ))}
    </View>
  );
}

function ActionCardView({ action, onPress }: { action: ActionCard; onPress: () => void }) {
  const { t } = useTranslation();
  const loc = useLoc();
  const icon =
    action.kind === 'documents' ? 'documents'
    : action.kind === 'map' ? 'map-pin'
    : action.kind === 'reminder' ? 'bell'
    : 'check';
  const cta =
    action.kind === 'documents' ? t('chat.actionDocsCta')
    : action.kind === 'map' ? t('chat.actionMapCta')
    : action.kind === 'reminder' ? t('chat.actionReminderCta')
    : t('chat.actionStepsCta');

  return (
    <View style={styles.actionCard}>
      <View style={styles.actionHead}>
        <View style={styles.actionIcon}>
          <Icon name={icon as any} size={16} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={2}>
            {loc(action.title)}
          </AppText>
          <AppText variant="caption" muted numberOfLines={2}>
            {loc(action.subtitle)}
          </AppText>
        </View>
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={cta}
        style={styles.actionCta}>
        <AppText variant="caption" weight="semibold" color={colors.primary}>
          {cta}
        </AppText>
        <Icon name="chevron-right" size={15} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  userRow: { alignItems: 'flex-end' },
  userBubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderBottomRightRadius: 6,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    maxWidth: '85%',
  },
  aiWrap: { gap: spacing.sm, maxWidth: '92%' },
  aiBubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  staleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: colors.warnSoft,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: HIT_TARGET - 8,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
});
