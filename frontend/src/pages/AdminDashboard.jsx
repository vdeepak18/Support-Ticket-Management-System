import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.get('/admin/stats').then((response) => setStats(response.data.data)).catch((err) => setError(err.response?.data?.message || 'Could not load statistics.')); }, []);
  return <><div className="mb-7"><p className="eyebrow">SUPPORT DESK</p><h1 className="page-title">Admin dashboard<span className="text-pista">.</span></h1><p className="mt-2 text-sm text-slate-500">A quick view of every customer request.</p></div>{error && <p className="error">{error}</p>}{!stats ? <p className="text-sm text-slate-500">Loading statistics…</p> : <><div className="mb-6 grid gap-3 sm:grid-cols-3"><Stat label="Total tickets" value={stats.total} /><Stat label="Open" value={stats.byStatus.open || 0} /><Stat label="In progress" value={stats.byStatus['in-progress'] || 0} /></div><div className="mb-6 grid gap-3 sm:grid-cols-3"><Stat label="Resolved" value={stats.byStatus.resolved || 0} /><Stat label="Closed" value={stats.byStatus.closed || 0} /><Stat label="High priority" value={stats.byPriority.high || 0} /></div><div className="card flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="font-bold text-slate-800">Manage ticket queue</h2><p className="mt-1 text-xs text-slate-500">Search tickets and update their status or priority.</p></div><Link to="/admin/tickets" className="button">Open all tickets →</Link></div></>}</>;
}
function Stat({ label, value }) { return <div className="card p-5"><p className="text-xs text-slate-500">{label}</p><strong className="mt-2 block text-3xl text-slate-800">{value}</strong></div>; }
