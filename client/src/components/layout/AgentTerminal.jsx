import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { sendCommand } from '../../api.js';

const CHIPS = [
  { label: 'Low stock',      cmd: 'Show low stock items' },
  { label: 'Pending orders', cmd: 'Show pending orders' },
  { label: 'Summary',        cmd: 'Give me a business summary' },
  { label: 'Appointments',   cmd: 'Show today\'s appointments' },
];

function TerminalBlock({ entry }) {
  if (entry.type === 'command') {
    return (
      <div className="flex items-start gap-2 py-1.5">
        <ChevronRight size={12} className="text-indigo-400 mt-0.5 shrink-0" />
        <span className="text-indigo-300 text-xs font-mono">{entry.text}</span>
      </div>
    );
  }

  if (entry.type === 'error') {
    return (
      <div className="my-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
        Error: {entry.text}
      </div>
    );
  }

  // agent response
  const { summary, result, plan } = entry;
  const docs = result?.docs ?? [];
  const hasTable = docs.length > 0 && plan?.collection;

  const TABLE_COLS = {
    inventory:    ['name', 'quantity', 'unit', 'price'],
    orders:       ['customerName', 'total', 'status', 'createdAt'],
    appointments: ['customerName', 'service', 'date', 'status'],
  };
  const cols = hasTable ? (TABLE_COLS[plan.collection] ?? []) : [];

  return (
    <div className="my-1.5 rounded-lg bg-[#0f0f1a] border border-[#1e1e30] overflow-hidden">
      <div className="px-3 py-2 text-xs text-slate-300 font-mono leading-relaxed">
        {summary}
      </div>

      {hasTable && docs.length > 0 && (
        <div className="border-t border-[#1e1e30] overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-[#0c0c14]">
                {cols.map(c => (
                  <th key={c} className="px-3 py-1.5 text-left text-slate-600 font-medium uppercase tracking-wide text-[9px]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.slice(0, 8).map((row, i) => (
                <tr key={i} className="border-t border-[#131320]">
                  {cols.map(c => (
                    <td key={c} className="px-3 py-1.5 text-slate-400 font-mono truncate max-w-[120px]">
                      {c === 'status'
                        ? <span className="text-amber-400">{row[c]}</span>
                        : (c === 'price' || c === 'total')
                          ? `$${Number(row[c] || 0).toFixed(2)}`
                          : c === 'createdAt'
                            ? new Date(row[c]).toLocaleDateString()
                            : c === 'items' && Array.isArray(row[c])
                              ? row[c].map(i => i.name).join(', ')
                              : String(row[c] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {docs.length > 8 && (
            <p className="px-3 py-1.5 text-[10px] text-slate-600 border-t border-[#131320]">
              +{docs.length - 8} more rows
            </p>
          )}
        </div>
      )}

      {/* Summary stats (for summary intent) */}
      {result && !hasTable && typeof result === 'object' && (
        <div className="border-t border-[#1e1e30] px-3 py-2 flex flex-wrap gap-3">
          {Object.entries(result)
            .filter(([k]) => typeof result[k] !== 'object')
            .map(([k, v]) => (
              <div key={k} className="text-[10px]">
                <span className="text-slate-600 uppercase tracking-wide">{k}</span>
                <span className="ml-1.5 text-slate-300 font-mono font-semibold">{String(v)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function AgentTerminal({ onDataChange }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const run = async (cmd) => {
    const command = cmd || input.trim();
    if (!command) return;
    setInput('');
    setHistory(h => [...h, { type: 'command', text: command, id: Date.now() }]);
    setLoading(true);
    try {
      const res = await sendCommand(command);
      setHistory(h => [...h, { type: 'response', ...res, id: Date.now() }]);
      if (onDataChange) onDataChange(res.plan?.collection);
    } catch (err) {
      setHistory(h => [...h, { type: 'error', text: err.message, id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run(); }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090f] border-l border-[#1a1a2e]">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 px-3 h-10 border-b border-[#1a1a2e] bg-[#0c0c14]">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[11px] text-slate-500 font-mono ml-1">agent — ops terminal</span>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 font-mono">
        {history.length === 0 && (
          <p className="text-[11px] text-slate-700 py-4 text-center">
            Type a command or pick a shortcut below
          </p>
        )}
        {history.map(entry => (
          <TerminalBlock key={entry.id} entry={entry} />
        ))}
        {loading && (
          <div className="flex items-center gap-1.5 py-2 pl-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div className="shrink-0 px-3 py-2 flex gap-1.5 flex-wrap border-t border-[#1a1a2e]">
        {CHIPS.map(c => (
          <button
            key={c.label}
            onClick={() => run(c.cmd)}
            disabled={loading}
            className="px-2.5 py-1 rounded-md text-[10px] font-medium border border-[#1e1e30] text-slate-500 hover:text-slate-300 hover:border-slate-600 hover:bg-white/5 transition-all disabled:opacity-40"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-[#1a1a2e]">
        <ChevronRight size={12} className="text-indigo-400 shrink-0" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
          placeholder="Enter a command…"
          className="flex-1 bg-transparent text-xs font-mono text-slate-200 placeholder-slate-700 outline-none disabled:opacity-40"
        />
        {input && (
          <button
            onClick={() => run()}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded px-1.5 py-0.5"
          >
            Run
          </button>
        )}
      </div>
    </div>
  );
}
