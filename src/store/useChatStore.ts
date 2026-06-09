import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { ChatMessage, Conversation } from '../data/types';
import { uid } from '../utils/id';
import { nowISO } from '../utils/date';
import { askAI } from '../services/ai';

interface ChatState {
  conversations: Conversation[];
  currentId: string | null;
  sending: boolean;

  newConversation: () => string;
  setCurrent: (id: string) => void;
  /** Pošalji korisničko pitanje i dobij AI odgovor (kreira razgovor ako ne postoji). */
  ask: (text: string) => Promise<void>;
  getCurrent: () => Conversation | undefined;
}

function appendMessage(conv: Conversation, msg: ChatMessage): Conversation {
  return { ...conv, messages: [...conv.messages, msg], updatedAt: nowISO() };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentId: null,
      sending: false,

      newConversation: () => {
        const id = uid('conv');
        const conv: Conversation = {
          id,
          title: 'Novi razgovor',
          messages: [],
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set(state => ({ conversations: [conv, ...state.conversations], currentId: id }));
        return id;
      },

      setCurrent: id => set({ currentId: id }),

      getCurrent: () => {
        const { conversations, currentId } = get();
        return conversations.find(c => c.id === currentId);
      },

      ask: async text => {
        let id = get().currentId;
        if (!id || !get().conversations.find(c => c.id === id)) {
          id = get().newConversation();
        }

        const userMsg: ChatMessage = {
          id: uid('msg'),
          role: 'user',
          text,
          createdAt: nowISO(),
        };

        set(state => ({
          sending: true,
          conversations: state.conversations.map(c =>
            c.id === id
              ? appendMessage(
                  c.messages.length === 0 ? { ...c, title: text.slice(0, 48) } : c,
                  userMsg,
                )
              : c,
          ),
        }));

        try {
          const result = await askAI(text);
          const aiMsg: ChatMessage = {
            id: uid('msg'),
            role: 'assistant',
            text: result.text,
            source: result.source,
            sourceDate: result.sourceDate,
            stale: result.stale,
            actions: result.actions,
            createdAt: nowISO(),
          };
          set(state => ({
            sending: false,
            conversations: state.conversations.map(c =>
              c.id === id ? appendMessage(c, aiMsg) : c,
            ),
          }));
        } catch {
          set({ sending: false });
        }
      },
    }),
    {
      name: 'uputime.chat',
      storage: zustandStorage,
      partialize: state => ({ conversations: state.conversations }),
    },
  ),
);
