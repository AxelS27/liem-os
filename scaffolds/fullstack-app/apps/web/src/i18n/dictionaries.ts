import type { Locale } from './config';
import type en from './locales/en.json';

// The default locale's JSON is the source of truth for the dictionary shape (ADR-010):
// a key missing or renamed in another locale becomes a type error at the call site.
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./locales/en.json').then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
