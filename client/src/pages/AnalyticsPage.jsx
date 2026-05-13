import { useState, useEffect } from 'react';
import { fetchCollection } from '../api.js';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: { background: '#0e0e1a', border: '1px solid #1e1e30', borderRadius: 8, fontSize: 11 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
};

const STATUS_COLORS = {
  pending:    '#f59e0b',
  processing: '#a78bfa',
  fulfilled:  '#10b981',
  completed:  '#10b981',
  cancelled:  '#64748b',
  scheduled:  '#3b82f6',
};

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e1e30]">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [inv, setInv] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCollection('inventory'), fetchCollection('orders')])
      .then(([i, o]) => { setInv(i); setOrders(o); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    );
  }

  // Orders by status — donut
  const statusCounts = Object.entries(
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Orders over time — area chart (group by date)
  const ordersByDate = Object.entries(
    orders.reduce((acc, o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Unknown';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).map(([date, count]) => ({ date, count })).slice(-14);

  // Top low stock items — bar chart
  const lowStock = [...inv]
    .filter(i => Number(i.quantity) < 20)
    .sort((a, b) => Number(a.quantity) - Number(b.quantity))
    .slice(0, 8)
    .map(i => ({ name: i.name?.split(' ').slice(0, 2).join(' '), qty: Number(i.quantity) }));

  // Inventory value by category — bar chart
  const valueByCategory = Object.entries(
    inv.reduce((acc, i) => {
      const cat = i.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(i.price) || 0) * (Number(i.quantity) || 0);
      return acc;
    }, {})
  ).map(([category, value]) => ({ category, value: Math.round(value) }));

  // Revenue trend — line chart (orders total by date)
  const revByDate = Object.entries(
    orders.reduce((acc, o) => {
      const d = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Unknown';
      acc[d] = (acc[d] || 0) + (Number(o.total) || 0);
      return acc;
    }, {})
  ).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) })).slice(-14);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-100">Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Business performance overview</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Orders over time */}
          <ChartCard title="Orders Over Time">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ordersByDate}>
                <defs>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#ordGrad)" strokeWidth={2} dot={false} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders by status — donut */}
          <ChartCard title="Orders by Status">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#64748b'} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue trend */}
          <ChartCard title="Revenue Trend">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revByDate}>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={42} tickFormatter={v => `$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Low stock — horizontal bar */}
          <ChartCard title="Low Stock Items">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lowStock} layout="vertical">
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="qty" name="Quantity" radius={[0, 4, 4, 0]}>
                  {lowStock.map((_, i) => (
                    <Cell key={i} fill={_.qty < 5 ? '#ef4444' : _.qty < 10 ? '#f59e0b' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Inventory value by category */}
          <ChartCard title="Inventory Value by Category">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={valueByCategory}>
                <XAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={48} tickFormatter={v => `$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}`, 'Value']} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
