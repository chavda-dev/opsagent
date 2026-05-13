import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ShoppingCart, Calendar, ArrowRight } from 'lucide-react';
import { fetchCollection } from '../../api.js';
import { useNavigate } from 'react-router-dom';

const ICONS = { inventory: Package, orders: ShoppingCart, appointments: Calendar };
const ROUTES = { inventory: '/inventory', orders: '/orders', appointments: '/appointments' };

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [inv, ord, apt] = await Promise.all([
          fetchCollection('inventory'),
          fetchCollection('orders'),
          fetchCollection('appointments'),
        ]);

        const q = query.toLowerCase();
        const match = (obj) => Object.values(obj).some(v => String(v).toLowerCase().includes(q));

        const hits = [
          ...inv.filter(match).slice(0, 4).map(r => ({ collection: 'inventory', doc: r, label: r.name })),
          ...ord.filter(match).slice(0, 4).map(r => ({ collection: 'orders', doc: r, label: r.customerName })),
          ...apt.filter(match).slice(0, 4).map(r => ({ collection: 'appointments', doc: r, label: r.customerName })),
        ];
        setResults(hits);
        setActiveIdx(0);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIdx]) {
      navigate(ROUTES[results[activeIdx].collection]);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.96, y: -8 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#0e0e1a] border border-[#2a2a3e] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e30]">
          <Search size={15} className="text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search inventory, orders, appointments…"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          />
          {loading && <span className="text-[10px] text-slate-600">searching…</span>}
          <kbd className="text-[10px] border border-[#2a2a3e] rounded px-1.5 py-0.5 text-slate-600">esc</kbd>
        </div>

        {results.length > 0 && (
          <ul className="py-1 max-h-72 overflow-y-auto scrollbar-thin">
            {results.map((r, i) => {
              const Icon = ICONS[r.collection];
              return (
                <li key={i}>
                  <button
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { navigate(ROUTES[r.collection]); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                      i === activeIdx ? 'bg-indigo-500/10' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon size={13} className="text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 truncate">{r.label}</p>
                      <p className="text-[10px] text-slate-600 capitalize">{r.collection}</p>
                    </div>
                    <ArrowRight size={12} className={`shrink-0 ${i === activeIdx ? 'text-indigo-400' : 'text-slate-700'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query && !loading && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-600">No results for "{query}"</p>
        )}
      </motion.div>
    </motion.div>
  );
}
