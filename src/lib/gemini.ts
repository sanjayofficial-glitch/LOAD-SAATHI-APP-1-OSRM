const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface SearchFilters {
  origin?: string;
  destination?: string;
  weight?: number;
  date?: string;
}

function parseWithRegex(query: string): SearchFilters | null {
  const filters: SearchFilters = {};
  const q = query.toLowerCase().trim();

  // Extract weight: "5 tonnes", "5 ton", "5t", "5 tons"
  const weightMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:tonne|ton|t)(?:s)?/i);
  if (weightMatch) {
    filters.weight = parseFloat(weightMatch[1]);
  }

  // Extract date mentions
  const today = new Date();
  if (/\b(now|today|immediately|asap)\b/i.test(q)) {
    filters.date = today.toISOString().split('T')[0];
  } else {
    const dateMatch = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (dateMatch) filters.date = dateMatch[1];
  }

  // Extract origin/destination using common patterns:
  // "from X to Y", "X to Y", "between X and Y"
  const fromToPatterns = [
    /(?:from|in)\s+([A-Za-z\s]+?)\s+(?:to|->|for|bound)\s+([A-Za-z\s]+?)(?:\s+(?:with|for|weight|tonne|ton|on|at|by)|$)/i,
    /^(?:send|ship|move|transport|carry|haul)\s+(?:.*?\s+)?(?:from|in)\s+([A-Za-z\s]+?)\s+(?:to|->)\s+([A-Za-z\s]+?)(?:\s|$)/i,
    /^(?:from|in)\s+([A-Za-z\s]+?)\s+(?:to|->)\s+([A-Za-z\s]+?)$/i,
  ];

  for (const pattern of fromToPatterns) {
    const match = q.match(pattern);
    if (match) {
      filters.origin = capitalize(match[1].trim());
      filters.destination = capitalize(match[2].trim());
      break;
    }
  }

  // Single city mention (if no origin/dest yet)
  if (!filters.origin && !filters.destination) {
    const cityMatch = q.match(/(?:to|in|at|near|for)\s+([A-Za-z\s]{3,}?)(?:\s+(?:with|for|weight|tonne|ton|on|at|by|$))/i);
    if (cityMatch) {
      filters.destination = capitalize(cityMatch[1].trim());
    }
  }

  return Object.keys(filters).length > 0 ? filters : null;
}

function capitalize(s: string): string {
  return s.trim().replace(/\b\w/g, c => c.toUpperCase());
}

export const parseNaturalLanguageSearch = async (query: string): Promise<SearchFilters> => {
  // Fast path: try regex first
  const regexResult = parseWithRegex(query);
  if (regexResult) return regexResult;

  // Fallback: use Gemini for complex queries
  if (!GEMINI_API_KEY) return {};

  const today = new Date().toISOString().split('T')[0];
  const prompt = `
    Extract logistics search filters from this query: "${query}"
    
    Rules:
    1. Return ONLY a JSON object with these keys: origin, destination, weight (number in tonnes), date (YYYY-MM-DD).
    2. If the user says "now", "today", or "immediately", use "${today}" as the date.
    3. If a value is missing, omit the key.
    4. Clean city names (e.g., "delhi" -> "Delhi").
    
    Example: "I want to send 2 tonnes from Delhi to Mumbai now"
    Output: {"origin": "Delhi", "destination": "Mumbai", "weight": 2, "date": "${today}"}
    
    Current date is ${today}.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) return {};

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
};
