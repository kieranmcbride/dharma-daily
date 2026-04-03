import type { Teaching } from '../types';

const KEYS = {
  lastFetchDate: 'dharma:lastFetchDate',
  currentQuote: 'dharma:currentQuote',
  seenQuotes: 'dharma:seenQuotes',
};

export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLastFetchDate(): string | null {
  return localStorage.getItem(KEYS.lastFetchDate);
}

export function getCurrentQuote(): Teaching | null {
  const raw = localStorage.getItem(KEYS.currentQuote);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Teaching;
  } catch {
    return null;
  }
}

export function getSeenQuotes(): string[] {
  const raw = localStorage.getItem(KEYS.seenQuotes);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveTeaching(teaching: Teaching): void {
  localStorage.setItem(KEYS.lastFetchDate, getToday());
  localStorage.setItem(KEYS.currentQuote, JSON.stringify(teaching));
  const seen = getSeenQuotes();
  seen.push(teaching.quote);
  localStorage.setItem(KEYS.seenQuotes, JSON.stringify(seen));
}
