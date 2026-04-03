import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are a scholar of Zen Buddhism and Theravada/Mahayana dharma teachings.
Return a single genuine teaching from a real, verifiable teacher.

Rules:
- Only use real quotes from real named teachers (Dōgen, Shunryu Suzuki, Thich Nhat Hanh, Pema Chödrön, Ajahn Chah, Kodo Sawaki, Huang Po, Linji, Bodhidharma, etc.)
- Include source text or talk name if known
- Do NOT invent or paraphrase-and-attribute quotes
- Do NOT use anonymous "Zen proverb" attributions unless genuinely traditional
- Keep the quote brief — one to four sentences maximum
- Do NOT repeat any quote from the provided seen list
- Return ONLY valid JSON — no markdown fences, no preamble

JSON structure:
{
  "quote": "...",
  "teacher": "...",
  "source": "..."
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { seenQuotes } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Give me today's dharma teaching. Do not use any of these quotes: ${JSON.stringify(seenQuotes ?? [])}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Anthropic error:', JSON.stringify(errorBody));
    return res.status(response.status).json({ error: 'Upstream API error', detail: errorBody });
  }

  const data = await response.json();
  const text = data.content[0].text;
  return res.status(200).json(JSON.parse(text));
}
