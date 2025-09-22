import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { distance } from "fastest-levenshtein";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, " and ") // sostituisce & con and
    .replace(/[^a-z0-9\s]/gi, "") // rimuove punteggiatura
    .replace(/\s+/g, " ") // spazi multipli → singolo
    .trim();
}

export interface MatchOptions {
  maxDistance?: number; // errori di battitura ammessi
  synonyms?: Record<string, string[]>; // sinonimi/alias
}

export function isTitleMatch(
  userInput: string,
  validTitles: string[],
  options: MatchOptions = {}
): boolean {
  const input = normalize(userInput);

  for (const title of validTitles) {
    const normTitle = normalize(title);

    // 1. Match diretto
    if (input === normTitle) return true;

    // 2. Match parziale (input contenuto in titolo o viceversa)
    if (normTitle.includes(input) || input.includes(normTitle)) return true;

    // 3. Fuzzy match (controllo distanza)
    const maxDist =
      options.maxDistance ?? Math.min(3, Math.floor(normTitle.length * 0.2));
    const d = distance(input, normTitle);
    if (d <= maxDist) return true;

    // 4. Sinonimi/alias
    if (options.synonyms && options.synonyms[title]) {
      for (const alias of options.synonyms[title]) {
        if (normalize(alias) === input) return true;
      }
    }
  }

  return false;
}
