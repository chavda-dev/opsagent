const MODEL = 'gemini-2.5-flash';

const SEARCH_FILTER_PROMPT = `You are an inventory search assistant.
Convert the user's natural language query into a MongoDB filter object.
Respond ONLY with a valid JSON object — no markdown, no code fences, no explanation.

Inventory document fields:
- name (string): product name
- category (string): "Dairy" | "Beverages" | "Grains & Pulses" | "Fruits & Vegetables" | "Bakery" | "Oils & Fats" | "Seafood"
- quantity (number): current stock level
- price (number): unit price in USD
- supplier (string): supplier company name
- status (string): "Active" | "Discontinued" | "Backordered"

Rules:
- Use { "$regex": "term", "$options": "i" } for case-insensitive string matching on name/category/supplier/status
- Use { "$lt": N }, { "$lte": N }, { "$gt": N }, { "$gte": N } for numeric comparisons
- "under $X" / "below $X" / "less than $X" → price: { "$lt": X }
- "over $X" / "above $X" / "more than $X" → price: { "$gt": X }
- "low stock" / "running low" → quantity: { "$lt": 10 }
- "out of stock" → quantity: 0
- If the query does not clearly map to any filter, return {}

Examples:
Query: "dairy items under $5"
{"category": "Dairy", "price": {"$lt": 5}}

Query: "low stock beverages"
{"category": "Beverages", "quantity": {"$lt": 10}}

Query: "items from Feedmix supplier"
{"supplier": {"$regex": "Feedmix", "$options": "i"}}

Query: "cheap grains under $2"
{"category": "Grains & Pulses", "price": {"$lt": 2}}

Query: "active seafood"
{"category": "Seafood", "status": "Active"}

Query: "backordered items"
{"status": "Backordered"}`;

function geminiUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
}

async function generate(prompt) {
  const res = await fetch(geminiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini API error ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

const PARSE_PROMPT = `You are OpsAgent, an AI assistant for small business operations.
Given a natural language command, respond ONLY with a single valid JSON object — no markdown, no code fences, no explanation.

The JSON must have exactly these three fields:
{
  "intent": "read" | "create" | "update" | "delete" | "summary",
  "collection": "inventory" | "orders" | "appointments",
  "parameters": { ... }
}

Intent rules:
- "read"    → fetch/show/list/find/get/search
- "create"  → add/create/insert/new
- "update"  → update/change/set/mark/edit
- "delete"  → delete/remove/cancel
- "summary" → summary/overview/stats/count/how many

Parameters for each intent:
- read:    filter fields (e.g. { "status": "pending" }) plus optional { "limit": N }
- create:  all fields for the new document
- update:  { "filter": { ...match fields... }, "update": { ...new values... } }
- delete:  { "filter": { ...match fields... } }
- summary: {} (empty)

Collection schema hints:
- inventory:    { name, quantity, unit, price, category }
- orders:       { customerName, items, total, status ("pending"|"completed"|"cancelled") }
- appointments: { customerName, service, date, time, status ("scheduled"|"completed"|"cancelled") }`;

export async function parseCommand(userCommand) {
  const text = await generate(`${PARSE_PROMPT}\n\nCommand: "${userCommand}"`);

  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Gemini did not return a valid JSON plan.');

  let plan;
  try {
    plan = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Gemini returned malformed JSON.');
  }

  if (!plan.intent || !plan.collection) {
    throw new Error('Gemini plan is missing required fields.');
  }

  return plan;
}

export async function parseSearchQuery(query) {
  const text = await generate(`${SEARCH_FILTER_PROMPT}\n\nQuery: "${query}"`);
  const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}

export async function summarizeResult(plan, result) {
  const prompt = `You are OpsAgent, a helpful business operations assistant.
The user ran this operation and got these results:

Intent: ${plan.intent}
Collection: ${plan.collection}
Result: ${JSON.stringify(result)}

Write a concise, friendly 1-2 sentence plain-English summary of what happened. No markdown.`;

  return (await generate(prompt)).trim();
}
