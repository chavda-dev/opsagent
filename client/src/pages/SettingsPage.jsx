import { Database, Cpu, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const ROWS = [
  { icon: Database, label: 'MongoDB Connection', value: 'Connected via MCP', tag: 'Live', tagStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { icon: Cpu,      label: 'AI Provider',         value: 'Google Gemini 2.0 Flash', tag: 'Active', tagStyle: 'bg-blue-50 text-blue-700 border-blue-200' },
  { icon: AlertTriangle, label: 'Low Stock Threshold', value: '10 units', tag: 'Default', tagStyle: 'bg-gray-100 text-gray-500 border-gray-200' },
  { icon: Clock,    label: 'Alert Polling Interval', value: 'Every 60 seconds', tag: 'Default', tagStyle: 'bg-gray-100 text-gray-500 border-gray-200' },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-4 sm:py-6 bg-[#F8F9FA]">
      <div className="max-w-xl">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-[#111827]">Settings</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">System configuration and status</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className={`flex items-center gap-4 px-5 py-4 ${i < ROWS.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}>
                <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[#6B7280]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#111827]">{row.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{row.value}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${row.tagStyle}`}>
                  {row.tag}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-4 flex items-start gap-3">
          <CheckCircle size={16} className="text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-900">All systems operational</p>
            <p className="text-xs text-indigo-600 mt-0.5">OpsAgent is connected to MongoDB Atlas and the AI agent is ready to process commands.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
