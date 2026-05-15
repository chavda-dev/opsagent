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
          ...inv.filter(match).slice(0, 4).map(r => ({ collection: 'inventory', doc: r, label: r.name, sub: r.category })),
          ...ord.filter(match).slice(0, 4).map(r => ({ collection: 'orders', doc: r, label: r.customer, sub: `$${r.total}` })),
          ...apt.filter(match).slice(0, 4).map(r => ({ collection: 'appointments', doc: r, label: r.customer, sub: r.purpose })),
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.97, y: -6 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F3F4F6]">
          <Search size={16} className="text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search inventory, orders, appointments…"
            className="flex-1 bg-transparent text-sm text-[#111827] placeholder-[#9CA3AF] outline-none"
          />
          {loading && <span className="text-[11px] text-[#9CA3AF]">searching…</span>}
          <kbd className="text-[10px] border border-[#E5E7EB] rounded-md px-1.5 py-0.5 text-[#9CA3AF] bg-[#F9FAFB] font-sans">esc</kbd>
        </div>

        {results.length > 0 && (
          <ul className="py-1.5 max-h-80 overflow-y-auto scrollbar-thin">
            {results.map((r, i) => {
              const Icon = ICONS[r.collection];
              return (
                <li key={i}>
                  <button
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => { navigate(ROUTES[r.collection]); onClose(); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                      i === activeIdx ? 'bg-indigo-50' : 'hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === activeIdx ? 'bg-indigo-100' : 'bg-[#F3F4F6]'}`}>
                      <Icon size={13} className={i === activeIdx ? 'text-indigo-600' : 'text-[#6B7280]'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] font-medium truncate">{r.label}</p>
                      <p className="text-[11px] text-[#9CA3AF] capitalize">{r.collection} · {r.sub}</p>
                    </div>
                    <ArrowRight size={13} className={i === activeIdx ? 'text-indigo-500' : 'text-[#D1D5DB]'} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query && !loading && results.length === 0 && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-[#6B7280]">No results for <span className="font-medium text-[#374151]">"{query}"</span></p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
