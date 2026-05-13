export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6">
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-slate-100">Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Application configuration</p>
        </div>

        <div className="bg-[#0e0e1a] border border-[#1e1e30] rounded-xl divide-y divide-[#1e1e30]">
          {[
            { label: 'MongoDB Connection', value: 'Connected via MCP', tag: 'live' },
            { label: 'AI Provider', value: 'Google Gemini', tag: 'active' },
            { label: 'Low Stock Threshold', value: '10 units', tag: 'default' },
            { label: 'Alert Polling Interval', value: '60 seconds', tag: 'default' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-slate-200">{row.label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{row.value}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] border border-[#1e1e30] text-slate-500">{row.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
