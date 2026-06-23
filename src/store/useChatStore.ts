import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandStorage } from './storage';
import { ChatMessage, Conversation } from '../data/types';
import { uid } from '../utils/id';
import { nowISO } from '../utils/date';
import { askAI, askProcedureAI, AIResult } from '../services/ai';

interface ChatState {
  conversations: Conversation[];
  currentId: string | null;
  sending: boolean;

  newConversation: () => string;
  setCurrent: (id: string) => void;
  /** Pošalji korisničko pitanje i dobij AI odgovor (kreira razgovor ako ne postoji). */
  ask: (text: string) => Promise<void>;
  /** Otvori unapred poznat postupak (predlog sa home ekrana) — bez pogađanja po ključnim rečima. */
  askProcedure: (procedureSlug: string, label: string) => Promise<void>;
  getCurrent: () => Conversation | undefined;
}

function appendMessage(conv: Conversation, msg: ChatMessage): Conversation {
  return { ...conv, messages: [...conv.messages, msg], updatedAt: nowISO() };
}

/** Zajednička logika: upiši korisničku poruku, pozovi AI i dodaj odgovor. */
async function send(
  set: (fn: (state: ChatState) => Partial<ChatState>) => void,
  get: () => ChatState,
  userText: string,
  fetcher: () => Promise<AIResult>,
): Promise<void> {
  let id = get().currentId;
  if (!id || !get().conversations.find(c => c.id === id)) {
    id = get().newConversation();
  }

  const userMsg: ChatMessage = {
    id: uid('msg'),
    role: 'user',
    text: userText,
    createdAt: nowISO(),
  };

  set(state => ({
    sending: true,
    conversations: state.conversations.map(c =>
      c.id === id
        ? appendMessage(
            c.messages.length === 0 ? { ...c, title: userText.slice(0, 48) } : c,
            userMsg,
          )
        : c,
    ),
  }));

  try {
    const result = await fetcher();
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
    set(() => ({ sending: false }));
  }
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

      ask: text => send(set, get, text, () => askAI(text)),

      askProcedure: (procedureSlug, label) =>
        send(set, get, label, () => askProcedureAI(procedureSlug)),
    }),
    {
      name: 'uputime.chat',
      storage: zustandStorage,
      partialize: state => ({ conversations: state.conversations }),
    },
  ),
);
