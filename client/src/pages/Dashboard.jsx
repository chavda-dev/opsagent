import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Calendar, AlertTriangle } from 'lucide-react';
import { fetchDashboard } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';

function KPICard({ label, value, icon: Icon, color, sub, trend }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  icon: 'text-indigo-400',  val: 'text-indigo-300' },
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'text-amber-400',   val: 'text-amber-300' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', val: 'text-emerald-300' },
    red:     { bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: 'text-red-400',     val: 'text-red-300' },
  };
  const c = colors[color] ?? colors.indigo;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-bold mt-1.5 ${c.val}`}>{value}</p>
          {sub && <p className="text-[11px] text-slate-600 mt-1">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.bg} border ${c.border}`}>
          <Icon size={16} className={c.icon} />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-[11px] ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span>{Math.abs(trend)}% from last week</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis ?? {};
  const recentOrders = data?.recentOrders ?? [];
  const lowStock = data?.lowStockAlerts ?? [];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overview of your business operations</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Inventory Value"
            value={`$${Number(kpis.totalInventoryValue ?? 0).toFixed(0)}`}
            icon={DollarSign}
            color="indigo"
            sub="Total stock value"
            trend={4.2}
          />
          <KPICard
            label="Pending Orders"
            value={kpis.pendingOrders ?? 0}
            icon={ShoppingCart}
            color="amber"
            sub="Awaiting fulfillment"
            trend={-2.1}
          />
          <KPICard
            label="Today's Appointments"
            value={kpis.todayAppointments ?? 0}
            icon={Calendar}
            color="emerald"
            sub="Scheduled for today"
          />
          <KPICard
            label="Low Stock Items"
            value={kpis.lowStockCount ?? 0}
            icon={AlertTriangle}
            color="red"
            sub="Below 10 units"
          />
        </div>

        {/* Two-column bottom section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e1e30] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Recent Orders</h2>
              <span className="text-[10px] text-slate-600">{recentOrders.length} records</span>
            </div>
            {recentOrders.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-600">No orders yet</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#0c0c14]">
                    {['Customer', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[9px] font-semibold uppercase tracking-wider text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o._id ?? i} className="border-t border-[#131320] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 text-slate-300">{o.customerName}</td>
                      <td className="px-4 py-2.5 text-slate-400">${Number(o.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={o.status} /></td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1e1e30] flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-400" />
              <h2 className="text-sm font-semibold text-slate-200">Low Stock Alerts</h2>
            </div>
            {lowStock.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-600">All items well stocked</p>
            ) : (
              <div className="divide-y divide-[#131320]">
                {lowStock.map((item, i) => (
                  <div key={item._id ?? i} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-xs text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-600">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-400">{item.quantity}</span>
                      <span className="text-[10px] text-slate-600">{item.unit}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/25 uppercase">low</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
