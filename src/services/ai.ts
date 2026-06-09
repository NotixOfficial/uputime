import { ActionCard } from '../data/types';
import { PROCEDURES, procedureById } from '../data/procedures';
import { institutionById } from '../data/institutions';
import { isStale } from '../utils/date';

// Mock AI: vraća isti oblik (AIResult) koji će kasnije davati backend.
// askAI se zameni fetch-om ka backendu, UI ostaje isti.
// AI uvek vraća actions (dokumenta, mapa, koraci), ne samo tekst.

export interface AIResult {
  text: string;
  /** Izvor (domen ili zakon). Ostaje u latinici, ne transliteruje se. */
  source?: string;
  /** Datum ažuriranja izvora (ISO). UI ga renderuje lokalizovano. */
  sourceDate?: string;
  stale?: boolean;
  actions: ActionCard[];
}

const KEYWORDS: Record<string, string[]> = {
  'prijava-boravista': ['boravist', 'boravis', 'prebivalist', 'prijav prebival', 'prijava bora'],
  'licna-karta': ['licna kart', 'licnu kart', 'licna karta', 'novu licnu', 'id kart'],
  'pasos': ['pasos', 'pasose', 'putna isprav', 'passport'],
  'registracija-vozila': ['registracij', 'registr vozil', 'vozilo', 'vozila', 'auto registr', 'saobracajn'],
  'pausalna-firma': ['firma', 'pausal', 'preduzetnik', 'apr', 'radnja', 'paus', 'biznis', 'otvor firmu'],
  'upis-godine': ['upis godin', 'upis', 'skolarin', 'indeks', 'fakultet', 'ftn'],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // ukloni dijakritike
    .replace(/[đ]/g, 'd');
}

function matchProcedureId(query: string): string | null {
  const q = normalize(query);
  let best: { id: string; score: number } | null = null;
  for (const [id, keys] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const k of keys) {
      if (q.includes(normalize(k))) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
}

function buildActions(procedureId: string): ActionCard[] {
  const proc = procedureById(procedureId);
  if (!proc) return [];
  const have = proc.documents.filter(d => d.defaultStatus === 'have').length;
  const need = proc.documents.length - have;
  const inst = institutionById(proc.institutionIds[0]);

  const actions: ActionCard[] = [
    {
      kind: 'documents',
      procedureSlug: proc.slug,
      title: `Lista dokumenata · ${proc.documents.length} stavke`,
      subtitle: `${have} već imaš · ${need} treba pribaviti`,
    },
  ];
  if (inst) {
    actions.push({
      kind: 'map',
      institutionId: inst.id,
      title: inst.name,
      subtitle: `${inst.address}, ${inst.city}`,
    });
  }
  actions.push({
    kind: 'steps',
    procedureSlug: proc.slug,
    title: `${proc.steps.length} koraka do kraja`,
    subtitle: 'Korak po korak do kraja',
  });
  return actions;
}

function buildText(procedureId: string): string {
  const proc = procedureById(procedureId)!;
  const inst = institutionById(proc.institutionIds[0]);
  const need = proc.documents.filter(d => d.defaultStatus === 'need').length;
  const place = inst ? `idi na šalter ${inst.shortName ?? inst.name}` : 'idi na nadležni šalter';
  return (
    `${proc.summary}\n\n` +
    `Pripremi ${proc.documents.length} dokumenta (${need} treba da pribaviš), ${place}` +
    `${proc.estimatedCost ? `, taksa je oko ${proc.estimatedCost}` : ''}. ` +
    `Otvori listu i korake ispod da te provedem do kraja.`
  );
}

const FALLBACK: AIResult = {
  text:
    'Pomažem oko administrativnih postupaka u Novom Sadu: prijava boravišta, lična karta, ' +
    'pasoš, registracija vozila, paušalna firma, upis godine. ' +
    'Opiši šta ti treba i dobićeš dokumenta, mesto i korake.',
  actions: PROCEDURES.filter(p => p.popular)
    .slice(0, 3)
    .map(p => ({
      kind: 'steps' as const,
      procedureSlug: p.slug,
      title: p.title,
      subtitle: `${p.steps.length} koraka · ${p.documents.length} dokumenata`,
    })),
};

/**
 * Glavni ulaz. U Fazi 2 telo se zamenjuje `fetch` pozivom ka backendu.
 */
export async function askAI(query: string): Promise<AIResult> {
  // mala pauza da se loader vidi
  await new Promise<void>(resolve => setTimeout(() => resolve(), 550));

  const procedureId = matchProcedureId(query);
  if (!procedureId) return FALLBACK;

  const proc = procedureById(procedureId)!;
  return {
    text: buildText(procedureId),
    source: proc.source,
    sourceDate: proc.updatedAt,
    stale: isStale(proc.updatedAt),
    actions: buildActions(procedureId),
  };
}
