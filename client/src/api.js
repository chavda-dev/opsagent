const BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const sendCommand     = (command) => post('/agent/command', { command });
export const fetchCollection = (col)    => get(`/${col}`);
export const fetchDashboard  = ()       => get('/dashboard');
export const fetchAnalytics  = ()       => get('/analytics');
export const fetchHealth     = ()       => get('/health');
