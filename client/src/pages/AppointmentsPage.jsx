import { useState, useEffect } from 'react';
import { RefreshCcw, List, Grid } from 'lucide-react';
import { fetchCollection } from '../api.js';
import StatusBadge from '../components/shared/StatusBadge.jsx';
import Drawer from '../components/shared/Drawer.jsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(anchor) {
  const d = new Date(anchor);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    return dt;
  });
}

const STATUS_COLOR = {
  scheduled: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  completed: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  cancelled: 'bg-slate-600/20 border-slate-600/30 text-slate-400',
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week');
  const [weekAnchor, setWeekAnchor] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    fetchCollection('appointments').then(setAppointments).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const weekDates = getWeekDates(weekAnchor);

  const aptsForDate = (date) => {
    const iso = date.toISOString().split('T')[0];
    return appointments.filter(a => (a.date || '').startsWith(iso));
  };

  const prevWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d); };
  const nextWeek = () => { const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d); };
  const goToday  = () => setWeekAnchor(new Date());

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-[#1a1a2e]">
        <h1 className="text-sm font-semibold text-slate-200">Appointments</h1>

        {view === 'week' && (
          <div className="flex items-center gap-2 ml-4">
            <button onClick={prevWeek} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 text-sm transition-all">‹</button>
            <button onClick={goToday} className="px-3 py-1 rounded-lg border border-[#1e1e30] text-xs text-slate-400 hover:text-slate-200 transition-all">Today</button>
            <button onClick={nextWeek} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 text-sm transition-all">›</button>
            <span className="text-xs text-slate-500 ml-1">
              {weekDates[0].toLocaleDateString('en', { month: 'short', day: 'numeric' })} –{' '}
              {weekDates[6].toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button onClick={load} className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#1e1e30] text-slate-500 hover:text-slate-300 transition-all">
            <RefreshCcw size={12} />
          </button>
          <div className="flex rounded-lg border border-[#1e1e30] overflow-hidden">
            {[['week', Grid], ['list', List]].map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all ${
                  view === v ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={12} />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">Loading appointments…</div>
      ) : view === 'week' ? (
        /* Week view */
        <div className="flex-1 overflow-auto scrollbar-thin p-6">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDates.map((date, i) => {
              const iso = date.toISOString().split('T')[0];
              const isToday = iso === today;
              const apts = aptsForDate(date);
              return (
                <div key={i} className={`rounded-xl border ${isToday ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-[#1e1e30] bg-[#0e0e1a]'} overflow-hidden`}>
                  <div className={`px-3 py-2.5 border-b ${isToday ? 'border-indigo-500/20' : 'border-[#1e1e30]'}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-indigo-400' : 'text-slate-600'}`}>
                      {DAYS[date.getDay()]}
                    </p>
                    <p className={`text-lg font-bold leading-none mt-0.5 ${isToday ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="p-2 flex flex-col gap-1.5 min-h-[80px]">
                    {apts.map((a, j) => (
                      <div
                        key={j}
                        onClick={() => setSelected(a)}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] cursor-pointer transition-all hover:opacity-80 ${STATUS_COLOR[a.status] ?? STATUS_COLOR.scheduled}`}
                      >
                        <p className="font-medium truncate">{a.customerName}</p>
                        <p className="opacity-70 truncate">{a.service}</p>
                        {a.time && <p className="opacity-60">{a.time}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-auto scrollbar-thin px-6 py-4">
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">No appointments found</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {['Customer', 'Service', 'Date', 'Time', 'Status'].map(h => (
                    <th key={h} className="sticky top-0 bg-[#0c0c14] text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-[#1a1a2e] z-10">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...appointments]
                  .sort((a, b) => (a.date > b.date ? 1 : -1))
                  .map((apt, i) => (
                    <tr key={apt._id ?? i} onClick={() => setSelected(apt)} className="border-b border-[#12121e] hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <td className="px-4 py-2.5 text-slate-200 text-xs">{apt.customerName}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{apt.service}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{apt.date}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{apt.time ?? '—'}</td>
                      <td className="px-4 py-2.5"><StatusBadge value={apt.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Appointment Details">
        {selected && (
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-[#131320] border border-[#1e1e30] rounded-xl p-4 flex flex-col gap-3">
              {[
                ['Customer', selected.customerName],
                ['Service', selected.service],
                ['Date', selected.date],
                ['Time', selected.time ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-200">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <StatusBadge value={selected.status} />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
