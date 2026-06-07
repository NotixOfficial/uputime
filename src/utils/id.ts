let counter = 0;

/** Jednostavan jedinstveni ID za lokalne entitete (poruke, podsetnici...). */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}
