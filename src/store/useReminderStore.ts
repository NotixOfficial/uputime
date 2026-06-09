import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage, SecureStore } from './storage';
import { Reminder } from '../data/types';
import { uid } from '../utils/id';
import { nowISO } from '../utils/date';
import {
  scheduleReminder,
  cancelReminder,
  cancelAllNotifications,
  NotifText,
} from '../services/notifications';

export const DEFAULT_NOTIFY_DAYS = [30, 7, 1];

interface NewReminderInput {
  documentType: string;
  expiryDate: string;
  notifyDaysBefore: number[];
  /** Opcioni osetljivi broj dokumenta , čuva se u Keychain (FZ-10). */
  sensitiveRef?: string;
}

/** Podrazumevani (srpski) tekstovi; UI sloj ih prepisuje lokalizovanim preko setNotifText. */
const DEFAULT_NOTIF_TEXT: NotifText = {
  title: docType => `Uskoro ističe: ${docType}`,
  body: (docType, date) => `${docType} ističe ${date}.`,
  channelName: 'Rokovi dokumenata',
};

interface ReminderState {
  reminders: Reminder[];
  /** Lokalizovani tekstovi notifikacija , postavlja UI (zbog i18n). */
  notifText: NotifText;

  setNotifText: (text: NotifText) => void;
  addReminder: (input: NewReminderInput) => Promise<Reminder>;
  removeReminder: (id: string) => Promise<void>;
  /** Briše sve podsetnike i OTKAZUJE zakazane notifikacije + osetljive reference (FZ-10). */
  clearReminders: () => Promise<void>;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      notifText: DEFAULT_NOTIF_TEXT,

      setNotifText: text => set({ notifText: text }),

      addReminder: async input => {
        const reminder: Reminder = {
          id: uid('rem'),
          documentType: input.documentType,
          expiryDate: input.expiryDate,
          notifyDaysBefore: input.notifyDaysBefore,
          hasSensitiveRef: !!input.sensitiveRef,
          createdAt: nowISO(),
        };

        if (input.sensitiveRef) {
          await SecureStore.set(`reminder.${reminder.id}`, input.sensitiveRef);
        }

        const scheduledIds = await scheduleReminder(reminder, get().notifText);
        reminder.scheduledNotificationIds = scheduledIds;

        set(state => ({ reminders: [...state.reminders, reminder] }));
        return reminder;
      },

      removeReminder: async id => {
        const reminder = get().reminders.find(r => r.id === id);
        if (reminder) {
          await cancelReminder(reminder.scheduledNotificationIds);
          if (reminder.hasSensitiveRef) {
            await SecureStore.remove(`reminder.${id}`);
          }
        }
        set(state => ({ reminders: state.reminders.filter(r => r.id !== id) }));
      },

      clearReminders: async () => {
        const reminders = get().reminders;
        for (const r of reminders) {
          await cancelReminder(r.scheduledNotificationIds);
          if (r.hasSensitiveRef) {
            await SecureStore.remove(`reminder.${r.id}`);
          }
        }
        // Sigurnosna mreža: otkaži i sve preostale zakazane notifikacije.
        await cancelAllNotifications();
        set({ reminders: [] });
      },
    }),
    {
      name: 'uputime.reminders',
      storage: zustandStorage,
      partialize: state => ({ reminders: state.reminders }),
    },
  ),
);
