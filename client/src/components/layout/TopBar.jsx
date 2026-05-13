import { useEffect, useState } from 'react';
import { Search, Terminal, RefreshCcw } from 'lucide-react';
import GlobalSearch from '../shared/GlobalSearch.jsx';

const DOT = {
  connected:    'bg-emerald-400',
  degraded:     'bg-amber-400',
  disconnected: 'bg-red-500',
  connecting:   'bg-slate-500 animate-pulse',
};
const LABEL = {
  connected:    'Live',
  degraded:     'Degraded',
  disconnected: 'Offline',
  connecting:   'Connecting',
};

export default function TopBar({ connStatus, terminalOpen, onToggleTerminal, onReconnect }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="shrink-0 h-14 flex items-center gap-4 px-5 border-b border-[#1a1a2e] bg-[#0c0c14] z-10">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 flex-1 max-w-sm px-3 py-1.5 rounded-lg bg-[#131320] border border-[#1e1e30] text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-all text-sm"
        >
          <Search size={13} />
          <span className="text-xs">Search inventory, orders…</span>
          <span className="ml-auto text-[10px] border border-[#2a2a3e] rounded px-1 py-0.5 text-slate-600">
            ⌘K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {/* Connection status */}
          {connStatus === 'disconnected' || connStatus === 'degraded' ? (
            <button
              onClick={onReconnect}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-all"
            >
              <RefreshCcw size={11} />
              Reconnect
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#1e1e30] bg-[#0f0f1a]">
              <span className={`w-1.5 h-1.5 rounded-full ${DOT[connStatus]}`} />
              <span className="text-[11px] text-slate-400">{LABEL[connStatus]}</span>
            </div>
          )}

          {/* Terminal toggle */}
          <button
            onClick={onToggleTerminal}
            title="Toggle Agent Terminal (Ctrl+`)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              terminalOpen
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                : 'text-slate-500 hover:text-slate-300 border-[#1e1e30] hover:border-slate-600'
            }`}
          >
            <Terminal size={13} />
            Agent
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            D
          </div>
        </div>
      </header>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
