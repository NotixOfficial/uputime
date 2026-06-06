// Domenski tipovi: institucije, postupci, dokumenti, podsetnici, chat.

/** Tipovi nadležnih institucija (za filter na mapi , FZ-03). */
export type InstitutionType =
  | 'mup'
  | 'opstina'
  | 'apr'
  | 'poreska'
  | 'sud'
  | 'maticar'
  | 'komunalno'
  | 'obrazovanje';

export interface WorkingHours {
  /** 0 = ponedeljak ... 6 = nedelja. Vrednost null = zatvoreno. */
  [day: number]: { open: string; close: string } | null;
}

export interface Institution {
  id: string;
  type: InstitutionType;
  name: string;
  shortName?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  workingHours: WorkingHours;
  /** Kratak opis za šta je nadležna. */
  note?: string;
}

/** Status stavke u čeklisti dokumenata (FZ-02). */
export type DocumentStatus = 'have' | 'need';

export interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  /** Podrazumevani status u seed podacima; korisnikov izbor se čuva odvojeno. */
  defaultStatus: DocumentStatus;
  /** Opcioni rok za pribavljanje stavke. */
  deadline?: string; // ISO datum
  /** Procena troška ili takse, npr. "320 din". */
  cost?: string;
}

export interface ProcedureStep {
  id: string;
  title: string;
  description: string;
  /** Kratke oznake: npr. "šalter 4 ili 5", "isti dan". */
  chips?: string[];
  /** Veže korak za konkretnu instituciju (za cross-tok ka mapi). */
  institutionId?: string;
}

/** Kategorija postupka (koristi se i kao tip ikone). */
export type ProcedureCategory =
  | 'licna-dokumenta'
  | 'boraviste'
  | 'vozila'
  | 'biznis'
  | 'obrazovanje'
  | 'komunalije'
  | 'ostalo';

export interface Procedure {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  category: ProcedureCategory;
  summary: string;
  /** Institucije relevantne za postupak (prva je primarna). */
  institutionIds: string[];
  documents: DocumentItem[];
  steps: ProcedureStep[];
  /** Izvor i datum ažuriranja , za prikaz pouzdanosti (FZ-01, NFR tačnost). */
  source: string;
  updatedAt: string; // ISO datum
  /** Da li je popularan ovog meseca (za "Pitaj" home). */
  popular?: boolean;
  /** Procena ukupne takse. */
  estimatedCost?: string;
}

/** Predefinisani brzi predlozi na home ekranu (FZ-01). */
export interface Suggestion {
  procedureSlug: string;
  label: string;
  meta: string;
}

/* ─────────────── Korisnički podaci (lokalno / sync) ─────────────── */

/** Praćenje napretka korisnika kroz jedan postupak (FZ-04). */
export interface ProcedureProgress {
  procedureId: string;
  /** Stavke dokumenata koje je korisnik označio kao "imam". */
  ownedDocumentIds: string[];
  /** Završeni koraci. */
  completedStepIds: string[];
  /** Rokovi koje je korisnik postavio po stavci dokumenta. */
  documentDeadlines: Record<string, string>;
  startedAt: string;
  updatedAt: string;
}

/** Podsetnik za istek ličnog dokumenta (FZ-05). */
export interface Reminder {
  id: string;
  /** npr. "Lična karta", "Pasoš", "Registracija vozila". */
  documentType: string;
  /** Opcioni broj/oznaka dokumenta , OSETLJIVO, čuva se odvojeno u Keychain (FZ-10). */
  hasSensitiveRef?: boolean;
  expiryDate: string; // ISO datum
  /** Offseti notifikacija u danima pre isteka (default: 30, 7, 1). */
  notifyDaysBefore: number[];
  createdAt: string;
  /** ID-evi zakazanih lokalnih notifikacija (notifee) za otkazivanje. */
  scheduledNotificationIds?: string[];
}

/* ─────────────── Chat / AI ─────────────── */

export type MessageRole = 'user' | 'assistant';

/** Strukturirana "action card" koju AI vraća uz odgovor (FZ-01 -> cross-tokovi). */
export type ActionCard =
  | {
      kind: 'documents';
      procedureSlug: string;
      title: string;
      subtitle: string;
    }
  | {
      kind: 'map';
      institutionId: string;
      title: string;
      subtitle: string;
    }
  | {
      kind: 'steps';
      procedureSlug: string;
      title: string;
      subtitle: string;
    }
  | {
      kind: 'reminder';
      documentType: string;
      title: string;
      subtitle: string;
    };

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  /** Izvor (domen/zakon, latinica) , samo za AI poruke. */
  source?: string;
  /** Datum ažuriranja izvora (ISO) , UI ga prikazuje lokalizovano. */
  sourceDate?: string;
  /** Da li je informacija potencijalno zastarela (>6 meseci). */
  stale?: boolean;
  actions?: ActionCard[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
