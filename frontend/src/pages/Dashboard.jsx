import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const params = { page, limit: 8, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) };
        const response = await api.get('/tickets', { params });
        if (!active) return;
        setTickets(response.data.data.tickets);
        setStats(response.data.data.stats);
        setPages(response.data.data.pagination.pages || 1);
      } catch (err) { if (active) setError(err.response?.data?.message || 'Could not load tickets.'); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [page, filters]);

  function changeFilter(name, value) { setPage(1); setFilters({ ...filters, [name]: value }); }

  return <>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">YOUR WORKSPACE</p><h1 className="page-title">My tickets<span className="text-pista">.</span></h1><p className="mt-2 text-sm text-slate-500">A clear view of your requests and where they stand.</p></div><Link to="/tickets/new" className="button">＋ New ticket</Link></div>
    {success && <p className="success mb-4">{success}</p>}
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{[['All requests', stats.total], ['Needs attention', stats.open], ['Resolved', stats.resolved]].map(([label, number]) => <div className="card p-5" key={label}><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-800">{number}</p></div>)}</div>
    <section className="card"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-800">Your requests</h2><p className="mt-1 text-xs text-slate-500">The latest updates on your support requests.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Search tickets" className="input w-44" placeholder="Search titles…" value={filters.search} onChange={(e) => changeFilter('search', e.target.value)} /><select className="input w-auto" value={filters.status} onChange={(e) => changeFilter('status', e.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><select className="input w-auto" value={filters.priority} onChange={(e) => changeFilter('priority', e.target.value)}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></div>
      {error && <p className="error mx-5 mt-4">{error}</p>}
      <div className="divide-y divide-slate-100">{loading ? <p className="p-8 text-center text-sm text-slate-500">Loading tickets…</p> : tickets.length ? tickets.map((ticket, index) => { const ticketId = ticket.id ?? ticket._id; return ticketId == null ? <p key={`${ticket.title}-${index}`} className="p-4 text-xs text-rose-600">This ticket is missing its ID. Refresh the page.</p> : <Link key={ticketId} to={`/tickets/${ticketId}`} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">{ticket.category} · Updated {new Date(ticket.updatedAt).toLocaleDateString()}</p></div><div className="flex items-center gap-4"><PriorityBadge priority={ticket.priority} /><StatusBadge status={ticket.status} /></div></Link> }) : <p className="p-9 text-center text-sm text-slate-500">{filters.search || filters.status || filters.priority ? 'No tickets match these filters.' : 'Your inbox is clear. Create a ticket when you need help.'}</p>}</div>
      {pages > 1 && <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="page-button" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></div>}
    </section>
  </>;
}
