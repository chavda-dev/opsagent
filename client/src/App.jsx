import { useState, useEffect } from 'react';
import { sendCommand, fetchCollection } from './api.js';
import ResultPanel from './components/ResultPanel.jsx';
import CommandBar from './components/CommandBar.jsx';
import DataPanel from './components/DataPanel.jsx';

function useConnection() {
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

const CONN_DOT = {
  connected:    'bg-emerald-400',
  degraded:     'bg-amber-400',
  disconnected: 'bg-red-500',
  connecting:   'bg-slate-500 animate-pulse',
};
const CONN_LABEL = {
  connected:    'Connected',
  degraded:     'Degraded',
  disconnected: 'Disconnected',
  connecting:   'Connecting…',
};

export default function App() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState('inventory');
  const [collectionData, setData]     = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const conn = useConnection();

  const loadCollection = async (col) => {
    setDataLoading(true);
    try {
      setData(await fetchCollection(col));
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { loadCollection(activeTab); }, [activeTab]);

  const handleCommand = async (command) => {
    setMessages(p => [...p, { role: 'user', text: command, ts: Date.now() }]);
    setLoading(true);
    try {
      const result = await sendCommand(command);
      setMessages(p => [...p, { role: 'agent', result, ts: Date.now() }]);
      const col = result.plan?.collection;
      if (col && col !== activeTab) setActiveTab(col);
      else loadCollection(activeTab);
    } catch (err) {
      setMessages(p => [...p, { role: 'error', text: err.message, ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#080810] text-slate-100 overflow-hidden">

      {/* ── Header ── */}
      <header className="shrink-0 h-14 flex items-center px-5 border-b border-[#1a1a2e] bg-[#0b0b16]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
            <span className="text-indigo-400 text-sm leading-none">⚡</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white tracking-tight">OpsAgent</p>
            <p className="text-[11px] text-slate-500">AI-powered business operations</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1e1e30] bg-[#0f0f1a]">
          <span className={`w-1.5 h-1.5 rounded-full ${CONN_DOT[conn]}`} />
          <span className="text-[11px] text-slate-400">{CONN_LABEL[conn]}</span>
        </div>
      </header>

      {/* ── Main two-panel layout ── */}
      <main className="flex flex-1 overflow-hidden">

        {/* Chat panel */}
        <section className="flex flex-col w-[44%] min-w-[320px] border-r border-[#1a1a2e]">
          <ResultPanel messages={messages} loading={loading} />
          <CommandBar onSubmit={handleCommand} loading={loading} />
        </section>

        {/* Data panel */}
        <section className="flex flex-col flex-1 overflow-hidden">
          <DataPanel
            data={collectionData}
            loading={dataLoading}
            collection={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
            onRefresh={() => loadCollection(activeTab)}
          />
        </section>

      </main>
    </div>
  );
}
