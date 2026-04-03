import type { Teaching } from '../types';
import { getSeenQuotes } from '../storage/teachingStorage';

export async function fetchTeaching(): Promise<Teaching> {
  const seenQuotes = getSeenQuotes();

  const response = await fetch('/api/teaching', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ seenQuotes }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<Teaching>;
}
