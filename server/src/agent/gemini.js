import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are OpsAgent, an AI assistant for small business operations.
You help business owners manage inventory, orders, and appointments.
When given a natural language command, you:
1. Identify the intent (query, create, update, delete)
2. Identify the target collection (inventory, orders, appointments)
3. Extract relevant parameters
4. Return a structured JSON plan to execute

Always respond with a JSON object in this format:
{
  "intent": "query|create|update|delete|summary",
  "collection": "inventory|orders|appointments",
  "parameters": { ... },
  "explanation": "Brief explanation of what you will do"
}`;

export async function parseCommand(userCommand) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `${SYSTEM_PROMPT}\n\nUser command: "${userCommand}"\n\nRespond ONLY with the JSON object, no markdown formatting.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Agent could not parse command into a valid plan.');

  return JSON.parse(jsonMatch[0]);
}

export async function summarizeResults(plan, results) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are OpsAgent. The user ran this operation:
Plan: ${JSON.stringify(plan)}
Results: ${JSON.stringify(results)}

Write a concise, friendly 1-2 sentence summary of what was done and the key findings. Plain text only.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
