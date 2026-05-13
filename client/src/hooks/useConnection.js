import { useState, useEffect } from 'react';

export function useConnection() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch('/api/health');
        const d = await r.json();
        setStatus(d.mongo ? 'connected' : 'degraded');
      } catch {
        setStatus('disconnected');
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  return status;
}
