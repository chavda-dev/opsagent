import { useState, useEffect } from 'react';
import { Download, RefreshCcw, Package } from 'lucide-react';
import { fetchCollection } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import Drawer from '../components/shared/Drawer.jsx';

const COLUMNS = ['pending', 'processing', 'completed', 'cancelled'];

function exportCSV(orders) {
  if (!orders.length) return;
  const keys = ['customer', 'total', 'status', 'date'];
  const rows = [keys.join(','), ...orders.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'orders-export.csv';
  a.click();
}

const COL_STYLE = {
  pending:    { dot: 'bg-amber-500',   head: 'text-amber-600',   count: 'bg-amber-50 text-amber-600 border-amber-200',   card: 'border-t-amber-400' },
  processing: { dot: 'bg-purple-500',  head: 'text-purple-600',  count: 'bg-purple-50 text-purple-600 border-purple-200', card: 'border-t-purple-400' },
  completed:  { dot: 'bg-emerald-500', head: 'text-emerald-600', count: 'bg-emerald-50 text-emerald-600 border-emerald-200', card: 'border-t-emerald-400' },
  cancelled:  { dot: 'bg-gray-400',    head: 'text-[#6B7280]',   count: 'bg-gray-100 text-gray-500 border-gray-200',     card: 'border-t-gray-300' },
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
      <div className="shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E5E7EB] bg-white flex-wrap">
        <div>
          <h1 className="text-base font-bold text-[#111827]">Orders</h1>
          <p className="text-xs text-[#9CA3AF]">{orders.length} total orders</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => exportCSV(orders)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] text-xs font-medium transition-all"
          >
            <Download size={12} />
            Export
          </button>
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-all"
          >
            <RefreshCcw size={12} />
          </button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm">Loading orders…</div>
      ) : (
        <div className="flex-1 overflow-x-auto scrollbar-thin p-6 bg-[#F8F9FA]">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const s = COL_STYLE[col];
              const colOrders = byStatus(col);
              return (
                <div key={col} className="flex flex-col w-72 shrink-0">
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${s.head}`}>
                      {col}
                    </span>
                    <span className={`ml-auto text-[10px] font-semibold border rounded-full px-2 py-0.5 ${s.count}`}>
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {colOrders.map((order, i) => (
                      <div
                        key={order._id ?? i}
                        onClick={() => setSelected(order)}
                        className={`bg-white rounded-xl border border-[#E5E7EB] border-t-2 ${s.card} p-4 cursor-pointer hover:shadow-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}
                      >
                        <div className="flex items-start justify-between mb-2.5">
                          <p className="text-sm font-semibold text-[#111827]">{order.customer}</p>
                          <StatusBadge value={order.status} />
                        </div>
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <Package size={11} className="text-[#9CA3AF] shrink-0" />
                            <p className="text-[11px] text-[#6B7280] truncate">
                              {order.items.map(i => i.name).join(', ')}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                          <span className="text-sm font-bold text-[#111827]">
                            ${Number(order.total || 0).toFixed(2)}
                          </span>
                          {(order.date || order.createdAt) && (
                            <span className="text-[10px] text-[#9CA3AF]">
                              {new Date(order.date || order.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {colOrders.length === 0 && (
                      <div className="flex items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-xl text-[11px] text-[#9CA3AF] min-h-[100px]">
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
          <div className="p-6 flex flex-col gap-5">
            <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-[#111827]">{selected.customer}</p>
                <StatusBadge value={selected.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Total</span>
                <span className="text-[#111827] font-bold text-base">${Number(selected.total || 0).toFixed(2)}</span>
              </div>
              {(selected.date || selected.createdAt) && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Date</span>
                  <span className="text-[#374151]">{new Date(selected.date || selected.createdAt).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {Array.isArray(selected.items) && selected.items.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Items</p>
                <div className="flex flex-col gap-1.5">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-sm">
                      <span className="text-[#374151] font-medium">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#9CA3AF]">×{item.quantity ?? item.qty}</span>
                        {item.price && <span className="text-[#374151] font-semibold">${Number(item.price).toFixed(2)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Move to</p>
              <div className="grid grid-cols-2 gap-2">
                {COLUMNS.filter(c => c !== selected.status).map(s => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => changeStatus(selected, s)}
                    className="py-2.5 rounded-lg border border-[#E5E7EB] text-sm text-[#374151] hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 capitalize transition-all disabled:opacity-50 font-medium"
                  >
                    {s}
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
