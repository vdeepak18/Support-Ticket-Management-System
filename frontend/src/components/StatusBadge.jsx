const names = { open: 'Open', 'in-progress': 'In progress', resolved: 'Resolved', closed: 'Closed' };
const colors = { open: 'bg-amber-50 text-amber-700', 'in-progress': 'bg-sky-50 text-sky-700', resolved: 'bg-green-50 text-green-700', closed: 'bg-slate-100 text-slate-600' };
export default function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status] || colors.closed}`}>{names[status] || status}</span>;
}
