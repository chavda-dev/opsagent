import { useEffect, useState } from 'react';
import { Search, Terminal, RefreshCcw, Menu } from 'lucide-react';
import GlobalSearch from '../shared/GlobalSearch.jsx';

const DOT = {
  connected:    'bg-emerald-500',
  degraded:     'bg-amber-500',
  disconnected: 'bg-red-500',
  connecting:   'bg-gray-400 animate-pulse',
};
const LABEL = {
  connected:    'Live',
  degraded:     'Degraded',
  disconnected: 'Offline',
  connecting:   'Connecting',
};

export default function TopBar({ connStatus, terminalOpen, onToggleTerminal, onReconnect, onMenuOpen }) {
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
      <header className="shrink-0 h-14 flex items-center gap-2 sm:gap-4 px-4 sm:px-5 border-b border-[#E5E7EB] bg-white z-10">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] transition-all shrink-0"
        >
          <Menu size={18} />
        </button>

        {/* Full search bar — sm+ */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all text-sm"
        >
          <Search size={13} />
          <span className="text-xs text-[#9CA3AF]">Search inventory, orders…</span>
          <span className="ml-auto text-[10px] border border-[#E5E7EB] rounded px-1.5 py-0.5 text-[#9CA3AF] bg-white hidden md:inline">
            ⌘K
          </span>
        </button>

        {/* Search icon — mobile only */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] text-[#9CA3AF] hover:border-[#D1D5DB] transition-all"
        >
          <Search size={15} />
        </button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Connection status */}
          {connStatus === 'disconnected' || connStatus === 'degraded' ? (
            <button
              onClick={onReconnect}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all"
            >
              <RefreshCcw size={11} />
              Reconnect
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className={`w-1.5 h-1.5 rounded-full ${DOT[connStatus]}`} />
              <span className="hidden sm:inline text-[11px] text-[#6B7280]">{LABEL[connStatus]}</span>
            </div>
          )}

          {/* Agent toggle */}
          <button
            onClick={onToggleTerminal}
            title="Toggle Agent (Ctrl+`)"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              terminalOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827] border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-[#F3F4F6]'
            }`}
          >
            <Terminal size={13} />
            <span className="hidden sm:inline">Agent</span>
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            D
          </div>
        </div>
      </header>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </>
  );
}
