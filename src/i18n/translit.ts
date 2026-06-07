// Latinica -> ćirilica. Jedan latinični izvor, ćirilica se generiše (ne dupliramo stringove).
// Sadržaj u {{...}} se ne transliteruje.

const DIGRAPHS: Array<[string, string]> = [
  ['Lj', 'Љ'], ['LJ', 'Љ'], ['lj', 'љ'],
  ['Nj', 'Њ'], ['NJ', 'Њ'], ['nj', 'њ'],
  ['Dž', 'Џ'], ['DŽ', 'Џ'], ['dž', 'џ'],
];

const MAP: Record<string, string> = {
  A: 'А', a: 'а', B: 'Б', b: 'б', V: 'В', v: 'в', G: 'Г', g: 'г',
  D: 'Д', d: 'д', Đ: 'Ђ', đ: 'ђ', E: 'Е', e: 'е', Ž: 'Ж', ž: 'ж',
  Z: 'З', z: 'з', I: 'И', i: 'и', J: 'Ј', j: 'ј', K: 'К', k: 'к',
  L: 'Л', l: 'л', M: 'М', m: 'м', N: 'Н', n: 'н', O: 'О', o: 'о',
  P: 'П', p: 'п', R: 'Р', r: 'р', S: 'С', s: 'с', T: 'Т', t: 'т',
  Ć: 'Ћ', ć: 'ћ', U: 'У', u: 'у', F: 'Ф', f: 'ф', H: 'Х', h: 'х',
  C: 'Ц', c: 'ц', Č: 'Ч', č: 'ч', Š: 'Ш', š: 'ш',
};

function transliterateChunk(input: string): string {
  let s = input;
  for (const [lat, cyr] of DIGRAPHS) {
    s = s.split(lat).join(cyr);
  }
  let out = '';
  for (const ch of s) {
    out += MAP[ch] ?? ch;
  }
  return out;
}

/**
 * Segmenti koji se NE transliterišu: i18next interpolacije, URL-ovi, email adrese i
 * domeni (npr. "mup.gov.rs"). Akronimi i šifre obrazaca (МУП, ПБ-1, ШВ-20) se
 * NAMERNO transliterišu jer je to ispravna srpska ćirilica.
 */
const PROTECTED =
  /(\{\{[^}]+\}\}|https?:\/\/[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|[A-Za-z0-9-]+(?:\.[A-Za-z]{2,})+)/g;

/** Transliteruje string, ali zadržava zaštićene segmente netaknute. */
export function transliterate(input: string): string {
  return input
    .split(PROTECTED)
    .map((part, i) => (i % 2 === 1 ? part : transliterateChunk(part)))
    .join('');
}

/** Rekurzivno transliteruje sve string vrednosti u resursnom objektu. */
export function transliterateResource<T>(obj: T): T {
  if (typeof obj === 'string') {
    return transliterate(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(transliterateResource) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = transliterateResource(value);
    }
    return result as T;
  }
  return obj;
}
