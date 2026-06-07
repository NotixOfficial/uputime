import dayjs from 'dayjs';
import 'dayjs/locale/sr';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

export const nowISO = (): string => dayjs().toISOString();

/** Format datuma za prikaz, npr. "16.06.2026." */
export function formatDate(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY.');
}

/** Broj punih dana od danas do datuma (može biti negativan ako je prošlo). */
export function daysUntil(iso: string): number {
  return dayjs(iso).startOf('day').diff(dayjs().startOf('day'), 'day');
}

/** Da li je informacija starija od 6 meseci (NFR tačnost / FZ-01). */
export function isStale(iso: string): boolean {
  return dayjs(iso).isBefore(dayjs().subtract(6, 'month'));
}

/** Datum X dana pre zadatog (za zakazivanje notifikacija). */
export function subtractDays(iso: string, days: number): Date {
  return dayjs(iso).subtract(days, 'day').hour(9).minute(0).second(0).toDate();
}

/** Parsira "DD.MM.YYYY" u ISO; vraća null ako je nevalidan. */
export function parseDMY(text: string): string | null {
  const cleaned = text.trim().replace(/\.$/, '');
  const d = dayjs(cleaned, ['DD.MM.YYYY', 'D.M.YYYY'], true);
  return d.isValid() ? d.hour(9).toISOString() : null;
}

/** ISO datum N godina od danas (za brze pretpostavke roka). */
export function isoInYears(years: number): string {
  return dayjs().add(years, 'year').toISOString();
}
