import { useState } from 'react';

const CHIPS = [
  { label: 'All inventory',        cmd: 'Show all inventory items' },
  { label: 'Low stock',            cmd: 'Show items with low stock' },
  { label: 'Pending orders',       cmd: 'Show all pending orders' },
  { label: 'Appointments today',   cmd: "Show today's appointments" },
  { label: 'Business summary',     cmd: 'Give me a summary of orders' },
  { label: 'Add inventory item',   cmd: 'Add 20 units of Coffee Beans at $12.99 per lb to inventory' },
];

export default function CommandBar({ onSubmit, loading }) {
  const [value, setValue] = useState('');

  const submit = () => {
    const cmd = value.trim();
    if (!cmd || loading) return;
    onSubmit(cmd);
    setValue('');
  };

  return (
    <div className="shrink-0 border-t border-[#1a1a2e] bg-[#0b0b16] px-4 pt-3 pb-4">
      {/* Example chips */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none pb-0.5">
        {CHIPS.map((c) => (
          <button
            key={c.label}
            onClick={() => setValue(c.cmd)}
            disabled={loading}
            className="shrink-0 px-2.5 py-1 rounded-full border border-[#1e1e30] text-[11px] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all disabled:opacity-40 whitespace-nowrap"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        <textarea
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          disabled={loading}
          placeholder="Tell OpsAgent what to do… (⏎ to send, Shift+⏎ for newline)"
          className="flex-1 bg-[#13131f] border border-[#1e1e30] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/15 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none resize-none transition-all disabled:opacity-40 leading-relaxed"
        />
        <button
          onClick={submit}
          disabled={loading || !value.trim()}
          className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-indigo-900/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
