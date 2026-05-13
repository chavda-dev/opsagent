const STYLE = {
  completed:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pending:    'bg-amber-500/15  text-amber-400  border-amber-500/25',
  cancelled:  'bg-slate-600/20  text-slate-400  border-slate-600/30',
  scheduled:  'bg-blue-500/15   text-blue-400   border-blue-500/25',
  processing: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  fulfilled:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
};

export default function StatusBadge({ value }) {
  const style = STYLE[value?.toLowerCase()] ?? STYLE.cancelled;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${style}`}>
      {value}
    </span>
  );
}
