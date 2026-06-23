import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Validator } from '../utils/validation';

export interface Field {
  value: string;
  setValue: (v: string) => void;
  /** Da li je polje "dodirnuto" (blur ili pokušaj slanja) — tek tada se greška prikazuje. */
  touched: boolean;
  /** Validno bez obzira na touched (za omogućavanje slanja). */
  valid: boolean;
  /** Prevedena poruka greške, ili undefined dok polje nije dodirnuto. */
  error?: string;
  /** Označi polje kao dodirnuto (otkriva grešku). */
  touch: () => void;
  reset: (next?: string) => void;
  /** Props spremni za prosleđivanje u <Input />. */
  inputProps: {
    value: string;
    onChangeText: (v: string) => void;
    onBlur: () => void;
    error?: string;
  };
}

/**
 * Kontroliše jedno polje forme sa validacijom.
 * HCI obrazac: greška se NE prikazuje dok korisnik kuca prvi put — pojavljuje se
 * na blur ili pri pokušaju slanja, a zatim se ažurira uživo dok korisnik ispravlja.
 */
export function useField(initial = '', validator?: Validator): Field {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);

  const errorObj = validator ? validator(value) : null;
  const error = touched && errorObj ? t(errorObj.key, errorObj.params) : undefined;

  const touch = useCallback(() => setTouched(true), []);
  const reset = useCallback((next = '') => {
    setValue(next);
    setTouched(false);
  }, []);

  return {
    value,
    setValue,
    touched,
    valid: !errorObj,
    error,
    touch,
    reset,
    inputProps: { value, onChangeText: setValue, onBlur: touch, error },
  };
}

/** Označi sva polja kao dodirnuta (pri pokušaju slanja) i vrati da li su sva validna. */
export function validateAll(...fields: Field[]): boolean {
  fields.forEach(f => f.touch());
  return fields.every(f => f.valid);
}
