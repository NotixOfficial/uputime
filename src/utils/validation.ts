import { parseDMY, daysUntil } from './date';

/**
 * Validacija polja za HCI feedback. Validatori vraćaju i18n ključ (+ parametre)
 * umesto gotovog teksta, da UI sloj prevede na aktivni jezik (sr-Latn / sr-Cyrl / en).
 * `null` znači da je vrednost validna.
 */
export type ValidationError = { key: string; params?: Record<string, unknown> } | null;
export type Validator = (value: string) => ValidationError;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email: obavezan + format. */
export const validateEmail: Validator = value => {
  const v = value.trim();
  if (!v) return { key: 'validation.emailRequired' };
  if (!EMAIL_RE.test(v)) return { key: 'validation.emailInvalid' };
  return null;
};

/** Lozinka: obavezna + minimalna dužina. */
export function validatePassword(min = 6): Validator {
  return value => {
    if (!value) return { key: 'validation.passwordRequired' };
    if (value.length < min) return { key: 'validation.passwordTooShort', params: { min } };
    return null;
  };
}

/** Obavezno tekstualno polje (trimovano). */
export function validateRequired(key = 'validation.required'): Validator {
  return value => (value.trim().length > 0 ? null : { key });
}

/** Ime/naziv: obavezno. */
export const validateName: Validator = validateRequired('validation.nameRequired');

/**
 * Datum isteka u formatu DD.MM.YYYY (blokira: prazno / neparsabilno).
 * Datum u prošlosti NE blokira čuvanje — za to služi `expiryDateWarning` (meko upozorenje).
 */
export const validateExpiryDate: Validator = value => {
  const v = value.trim();
  if (!v) return { key: 'validation.dateRequired' };
  if (!parseDMY(v)) return { key: 'validation.dateInvalid' };
  return null;
};

/** Meko upozorenje (ne blokira) ako je uneti, validan datum već prošao. */
export const expiryDateWarning: Validator = value => {
  const iso = parseDMY(value.trim());
  if (iso && daysUntil(iso) < 0) return { key: 'validation.datePast' };
  return null;
};

/** Spaja više validatora; vraća prvu grešku. */
export function compose(...validators: Validator[]): Validator {
  return value => {
    for (const v of validators) {
      const err = v(value);
      if (err) return err;
    }
    return null;
  };
}
