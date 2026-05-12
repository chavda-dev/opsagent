import { useEffect, useRef } from 'react';

export default function ResultPanel({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <span className="text-xl text-indigo-400">⚡</span>
        </div>
        <p className="text-slate-300 font-medium text-sm mb-1">Send a command to get started</p>
        <p className="text-slate-600 text-xs leading-relaxed max-w-[220px]">
          Try "Show all inventory" or "Give me a business summary"
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
      {messages.map((msg, i) => {

        if (msg.role === 'user') {
          return (
            <div key={i} className="flex justify-end">
              <div className="max-w-[78%] bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-lg shadow-indigo-900/20">
                <p className="text-sm text-white leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        }

        if (msg.role === 'error') {
          return (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] bg-red-500/8 border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Error</p>
                <p className="text-sm text-red-300 leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );
        }

        const { plan, result, summary } = msg.result;
        return (
          <div key={i} className="flex justify-start">
            <div className="max-w-[88%]">
              {/* Avatar + label */}
              <div className="flex items-center gap-2 mb-1.5 ml-0.5">
                <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-indigo-400 leading-none">⚡</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">OpsAgent</span>
              </div>

              {/* Bubble */}
              <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl rounded-tl-sm overflow-hidden">
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-200 leading-relaxed">{summary}</p>
                </div>

                <details className="border-t border-[#1e1e30] group">
                  <summary className="px-4 py-2 text-[11px] text-slate-500 cursor-pointer hover:text-slate-300 flex items-center gap-2 transition-colors select-none">
                    <span className="flex gap-1.5">
                      <Badge color="indigo">{plan.intent}</Badge>
                      <Badge color="slate">{plan.collection}</Badge>
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      View details
                      <svg className="w-3 h-3 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-4 pb-3 pt-2">
                    <pre className="text-[11px] text-slate-400 font-mono leading-relaxed overflow-x-auto scrollbar-thin bg-[#0a0a14] rounded-lg p-3 border border-[#1a1a2e]">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        );
      })}

      {loading && (
        <div className="flex justify-start">
          <div className="max-w-[88%]">
            <div className="flex items-center gap-2 mb-1.5 ml-0.5">
              <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <span className="text-[9px] text-indigo-400 leading-none">⚡</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">OpsAgent</span>
            </div>
            <div className="bg-[#13131f] border border-[#1e1e30] rounded-2xl rounded-tl-sm px-4 py-3.5">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

function Badge({ color, children }) {
  const styles = {
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    slate:  'bg-slate-700/50 text-slate-400 border-slate-600/30',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${styles[color]}`}>
      {children}
    </span>
  );
}
