import { WorkingHours } from '../data/types';

/** JS getDay() (0=ned) -> naš indeks (0=pon ... 6=ned). */
export function jsToAppDay(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export interface OpenStatus {
  openNow: boolean;
  /** Vreme zatvaranja danas (ako je trenutno otvoreno). */
  closesAt?: string;
  /** Vreme otvaranja (ako je trenutno zatvoreno, a danas radi). */
  opensAt?: string;
}

export function getOpenStatus(hours: WorkingHours, now: Date = new Date()): OpenStatus {
  const day = jsToAppDay(now.getDay());
  const today = hours[day];
  if (!today) return { openNow: false };

  const cur = now.getHours() * 60 + now.getMinutes();
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  if (cur >= open && cur < close) {
    return { openNow: true, closesAt: today.close };
  }
  if (cur < open) {
    return { openNow: false, opensAt: today.open };
  }
  return { openNow: false };
}

/** Lista dana sa radnim vremenom za prikaz u detalju (pon->ned). */
export function workingHoursRows(
  hours: WorkingHours,
): Array<{ day: number; label: string | null }> {
  return [0, 1, 2, 3, 4, 5, 6].map(day => {
    const h = hours[day];
    return { day, label: h ? `${h.open} - ${h.close}` : null };
  });
}
