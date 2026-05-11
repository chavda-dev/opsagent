const BASE = '/api';

export async function sendCommand(command) {
  const res = await fetch(`${BASE}/agent/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export async function fetchCollection(collection) {
  const res = await fetch(`${BASE}/${collection}`);
  if (!res.ok) throw new Error(`Failed to fetch ${collection}`);
  return res.json();
}
