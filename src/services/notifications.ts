import { Platform } from 'react-native';
import { Reminder } from '../data/types';
import { subtractDays, formatDate } from '../utils/date';

// Lokalne notifikacije za rokove. Rade offline. notifee se učitava lenjo (da ne padne ako modul nije linkovan).

const CHANNEL_ID = 'uputime-reminders';

function getNotifee(): any | null {
  try {
    return require('@notifee/react-native').default;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const notifee = getNotifee();
  if (!notifee) return false;
  try {
    const settings = await notifee.requestPermission();
    // AuthorizationStatus.AUTHORIZED = 1, PROVISIONAL = 2
    return settings.authorizationStatus >= 1;
  } catch {
    return false;
  }
}

async function ensureChannel(notifee: any, channelName: string): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: channelName,
      importance: 4, // HIGH
    });
  }
}

/** Lokalizovani tekstovi notifikacije (prosleđuje ih UI sloj jer ima `t`). */
export interface NotifText {
  title: (docType: string) => string;
  body: (docType: string, date: string) => string;
  channelName: string;
}

/**
 * Zakazuje notifikacije za jedan podsetnik (po jedna za svaki offset koji je u budućnosti).
 * Vraća listu ID-eva zakazanih notifikacija (za kasnije otkazivanje).
 */
export async function scheduleReminder(
  reminder: Reminder,
  text: NotifText,
): Promise<string[]> {
  const notifee = getNotifee();
  if (!notifee) return [];
  try {
    const { TriggerType } = require('@notifee/react-native');
    await ensureChannel(notifee, text.channelName);

    const ids: string[] = [];
    for (const offset of reminder.notifyDaysBefore) {
      const fireDate = subtractDays(reminder.expiryDate, offset);
      if (fireDate.getTime() <= Date.now()) continue; // preskoči prošle

      const id = `${reminder.id}__${offset}`;
      await notifee.createTriggerNotification(
        {
          id,
          title: text.title(reminder.documentType),
          body: text.body(reminder.documentType, formatDate(reminder.expiryDate)),
          android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
        },
        { type: TriggerType.TIMESTAMP, timestamp: fireDate.getTime() },
      );
      ids.push(id);
    }
    return ids;
  } catch {
    return [];
  }
}

/** Otkazuje SVE zakazane lokalne notifikacije (npr. pri brisanju svih podataka). */
export async function cancelAllNotifications(): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  try {
    await notifee.cancelTriggerNotifications();
  } catch {
    // ignore
  }
}

export async function cancelReminder(notificationIds: string[] = []): Promise<void> {
  const notifee = getNotifee();
  if (!notifee) return;
  try {
    for (const id of notificationIds) {
      await notifee.cancelTriggerNotification(id);
    }
  } catch {
    // ignore
  }
}
