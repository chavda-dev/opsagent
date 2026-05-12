const TABS = ['inventory', 'orders', 'appointments'];

const TAB_ICONS = {
  inventory:    '📦',
  orders:       '🛒',
  appointments: '📅',
};

/* Columns to show per collection (in order) */
const COLS = {
  inventory:    ['name', 'quantity', 'unit', 'price', 'category'],
  orders:       ['customerName', 'items', 'total', 'status', 'createdAt'],
  appointments: ['customerName', 'service', 'date', 'time', 'status'],
};

const COL_LABELS = {
  customerName: 'Customer',
  createdAt:    'Date',
};

const STATUS_STYLE = {
  completed:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pending:    'bg-amber-500/15  text-amber-400  border-amber-500/25',
  cancelled:  'bg-slate-600/20  text-slate-400  border-slate-600/30',
  scheduled:  'bg-blue-500/15   text-blue-400   border-blue-500/25',
};

function StatusBadge({ val }) {
  const style = STATUS_STYLE[val] ?? STATUS_STYLE.cancelled;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
      {val}
    </span>
  );
}

function CellValue({ col, val, collection }) {
  if (val === null || val === undefined) {
    return <span className="text-slate-600">—</span>;
  }

  if (col === 'status') return <StatusBadge val={val} />;

  if ((col === 'price' || col === 'total') && !isNaN(val)) {
    return <span>${Number(val).toFixed(2)}</span>;
  }

  if (col === 'items' && Array.isArray(val)) {
    return (
      <span className="text-slate-400 text-xs">
        {val.map(i => `${i.name} ×${i.qty}`).join(', ')}
      </span>
    );
  }

  if (col === 'createdAt') {
    return (
      <span className="text-slate-400 text-xs">
        {new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    );
  }

  if (col === 'quantity' && collection === 'inventory') {
    const n = Number(val);
    return (
      <span className={n < 10 ? 'text-red-400 font-semibold' : ''}>
        {val}
        {n < 10 && (
          <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25 uppercase tracking-wide">
            low
          </span>
        )}
      </span>
    );
  }

  if (typeof val === 'object') return <span className="text-slate-500 text-xs">{JSON.stringify(val)}</span>;
  return <span>{String(val)}</span>;
}

function rowHighlight(row, collection) {
  if (collection === 'inventory' && Number(row.quantity) < 10) {
    return 'bg-red-500/[0.03] hover:bg-red-500/[0.06]';
  }
  if (collection === 'orders' && row.status === 'pending') {
    return 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]';
  }
  return 'hover:bg-white/[0.02]';
}

export default function DataPanel({ data, loading, collection, onTabChange, onRefresh }) {
  const cols = COLS[collection] ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-1 px-4 py-2.5 border-b border-[#1a1a2e] bg-[#0b0b16]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              tab === collection
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent',
            ].join(' ')}
          >
            <span>{TAB_ICONS[tab]}</span>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}

        <button
          onClick={onRefresh}
          title="Refresh"
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 hover:border-slate-500/50 transition-all text-sm"
        >
          ↻
        </button>
      </div>

      {/* Table area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          Loading {collection}…
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 text-sm gap-1">
          <p>No {collection} records found.</p>
          <p className="text-xs text-slate-700">Use the command bar to add data.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="sticky top-0 bg-[#0e0e1a] text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#1a1a2e] whitespace-nowrap z-10"
                  >
                    {COL_LABELS[col] ?? col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row._id ?? i} className={`border-b border-[#12121e] transition-colors ${rowHighlight(row, collection)}`}>
                  {cols.map((col) => (
                    <td key={col} className="px-4 py-2.5 text-slate-300 text-xs max-w-[180px] truncate">
                      <CellValue col={col} val={row[col]} collection={collection} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      {data && data.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-[#1a1a2e] bg-[#0b0b16] text-[11px] text-slate-600 flex items-center justify-between">
          <span>{data.length} record{data.length !== 1 ? 's' : ''}</span>
          {collection === 'inventory' && (
            <span className="text-red-500/70">
              {data.filter(r => Number(r.quantity) < 10).length} low stock
            </span>
          )}
          {collection === 'orders' && (
            <span className="text-amber-500/70">
              {data.filter(r => r.status === 'pending').length} pending
            </span>
          )}
        </div>
      )}

    </div>
  );
}
