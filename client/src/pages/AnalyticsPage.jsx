import { useState, useEffect } from 'react';
import { fetchCollection } from '../api.js';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  labelStyle: { color: '#374151', fontWeight: 600 },
  itemStyle: { color: '#111827' },
};

const STATUS_COLORS = {
  pending:    '#F59E0B',
  processing: '#8B5CF6',
  fulfilled:  '#10B981',
  completed:  '#10B981',
  cancelled:  '#9CA3AF',
  scheduled:  '#3B82F6',
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="px-5 py-4 border-b border-[#F3F4F6]">
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
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
          {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    );
  }

  const statusCounts = Object.entries(
    orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const ordersByDate = Object.entries(
    orders.reduce((acc, o) => {
      const d = (o.date || o.createdAt)
        ? new Date(o.date || o.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
        : 'Unknown';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {})
  ).map(([date, count]) => ({ date, count })).slice(-14);

  const lowStock = [...inv]
    .filter(i => Number(i.quantity) < 20)
    .sort((a, b) => Number(a.quantity) - Number(b.quantity))
    .slice(0, 8)
    .map(i => ({ name: i.name?.split(' ').slice(0, 2).join(' '), qty: Number(i.quantity) }));

  const valueByCategory = Object.entries(
    inv.reduce((acc, i) => {
      const cat = i.category || 'Other';
      acc[cat] = (acc[cat] || 0) + (Number(i.price) || 0) * (Number(i.quantity) || 0);
      return acc;
    }, {})
  ).map(([category, value]) => ({ category, value: Math.round(value) }));

  const revByDate = Object.entries(
    orders.reduce((acc, o) => {
      const d = (o.date || o.createdAt)
        ? new Date(o.date || o.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })
        : 'Unknown';
      acc[d] = (acc[d] || 0) + (Number(o.total) || 0);
      return acc;
    }, {})
  ).map(([date, revenue]) => ({ date, revenue: Math.round(revenue) })).slice(-14);

  const axisStyle = { fill: '#9CA3AF', fontSize: 11 };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4 sm:py-6 bg-[#F8F9FA]">
      <div className="max-w-5xl">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-[#111827]">Analytics</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Business performance overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Orders over time */}
          <ChartCard title="Orders Over Time" subtitle="Last 14 days">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ordersByDate}>
                <defs>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={24} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#ordGrad)" strokeWidth={2.5} dot={false} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Orders by status */}
          <ChartCard title="Orders by Status" subtitle="Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {statusCounts.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Revenue trend */}
          <ChartCard title="Revenue Trend" subtitle="Order totals by day">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revByDate}>
                <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={48} tickFormatter={v => `$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Low stock */}
          <ChartCard title="Low Stock Items" subtitle="Items below 20 units">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lowStock} layout="vertical">
                <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={90} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="qty" name="Quantity" radius={[0, 4, 4, 0]}>
                  {lowStock.map((entry, i) => (
                    <Cell key={i} fill={entry.qty < 5 ? '#EF4444' : entry.qty < 10 ? '#F59E0B' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Inventory value by category */}
          <ChartCard title="Inventory Value by Category" subtitle="Total stock value ($)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={valueByCategory}>
                <XAxis dataKey="category" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={52} tickFormatter={v => `$${v}`} />
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
