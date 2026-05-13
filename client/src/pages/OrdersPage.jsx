import { useState, useEffect } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { fetchCollection } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import Drawer from '../components/shared/Drawer.jsx';

const COLUMNS = ['pending', 'processing', 'fulfilled', 'cancelled'];

function exportCSV(orders) {
  if (!orders.length) return;
  const keys = ['customerName', 'total', 'status', 'createdAt'];
  const rows = [keys.join(','), ...orders.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'orders.csv';
  a.click();
}

const COL_STYLE = {
  pending:    { bg: 'border-amber-500/20',   dot: 'bg-amber-400',   head: 'text-amber-400' },
  processing: { bg: 'border-purple-500/20',  dot: 'bg-purple-400',  head: 'text-purple-400' },
  fulfilled:  { bg: 'border-emerald-500/20', dot: 'bg-emerald-400', head: 'text-emerald-400' },
  cancelled:  { bg: 'border-slate-600/30',   dot: 'bg-slate-500',   head: 'text-slate-500' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    fetchCollection('orders').then(setOrders).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const changeStatus = async (order, newStatus) => {
    setUpdating(true);
    try {
      await fetch(`/api/orders/${order._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      load();
      setSelected(null);
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  const byStatus = (status) => orders.filter(o => o.status === status);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-[#1a1a2e]">
        <h1 className="text-sm font-semibold text-slate-200">Orders</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => exportCSV(orders)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 text-xs transition-all">
            <Download size={12} />
            Export
          </button>
          <button onClick={load} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 transition-all">
            <RefreshCcw size={12} />
          </button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Loading orders…</div>
      ) : (
        <div className="flex-1 overflow-x-auto scrollbar-thin p-6">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const s = COL_STYLE[col];
              const colOrders = byStatus(col);
              return (
                <div key={col} className="flex flex-col w-72 shrink-0">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${s.head}`}>
                      {col}
                    </span>
                    <span className="ml-auto text-[10px] text-slate-600 bg-[#131320] border border-[#1e1e30] rounded-full px-2 py-0.5">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 flex-1">
                    {colOrders.map((order, i) => (
                      <div
                        key={order._id ?? i}
                        onClick={() => setSelected(order)}
                        className={`bg-[#0e0e1a] border ${s.bg} rounded-xl p-4 cursor-pointer hover:bg-[#13131e] transition-all group`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-slate-200">{order.customerName}</p>
                          <StatusBadge value={order.status} />
                        </div>
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <p className="text-[11px] text-slate-600 mb-2 truncate">
                            {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-300">
                            ${Number(order.total || 0).toFixed(2)}
                          </span>
                          {order.createdAt && (
                            <span className="text-[10px] text-slate-700">
                              {new Date(order.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {colOrders.length === 0 && (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#1a1a2e] rounded-xl text-[11px] text-slate-700 min-h-[80px]">
                        No {col} orders
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order detail drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Order Details">
        {selected && (
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-[#131320] border border-[#1e1e30] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">{selected.customerName}</p>
                <StatusBadge value={selected.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total</span>
                <span className="text-slate-200 font-semibold">${Number(selected.total || 0).toFixed(2)}</span>
              </div>
              {selected.createdAt && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Date</span>
                  <span className="text-slate-400">{new Date(selected.createdAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {Array.isArray(selected.items) && selected.items.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-2">Items</p>
                <div className="flex flex-col gap-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0c0c14] border border-[#1e1e30] rounded-lg px-3 py-2 text-xs">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-slate-500">×{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wide mb-2">Change Status</p>
              <div className="grid grid-cols-2 gap-2">
                {COLUMNS.filter(c => c !== selected.status).map(s => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => changeStatus(selected, s)}
                    className="py-2 rounded-lg border border-[#1e1e30] text-xs text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-white/5 capitalize transition-all disabled:opacity-50"
                  >
                    → {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
