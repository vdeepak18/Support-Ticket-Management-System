const colors = { low: 'text-green-700', medium: 'text-amber-700', high: 'text-rose-700' };
export default function PriorityBadge({ priority }) {
  return <span className={`text-xs font-medium capitalize ${colors[priority] || 'text-slate-500'}`}>● {priority}</span>;
}
