import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) };
      const response = await api.get('/admin/tickets', { params });
      setTickets(response.data.data.tickets); setPages(response.data.data.pagination.pages || 1);
    } catch (err) { setError(err.response?.data?.message || 'Could not load tickets.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [page, filters]);

  async function update(id, field, value) {
    setError(''); setSuccess('');
    try { await api.patch(`/admin/tickets/${id}/${field}`, { [field]: value }); setSuccess('Ticket updated.'); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not update the ticket.'); }
  }
  function filter(name, value) { setPage(1); setFilters({ ...filters, [name]: value }); }

  return <><div className="mb-7"><p className="eyebrow">SUPPORT DESK</p><h1 className="page-title">All tickets<span className="text-pista">.</span></h1><p className="mt-2 text-sm text-slate-500">Search, filter, and manage customer requests.</p></div>{error && <p className="error mb-4">{error}</p>}{success && <p className="success mb-4">{success}</p>}
    <section className="card overflow-hidden"><div className="flex flex-wrap gap-2 border-b border-slate-100 p-4"><input className="input w-52" placeholder="Search ticket titles…" value={filters.search} onChange={(e) => filter('search', e.target.value)} /><select className="input w-auto" value={filters.status} onChange={(e) => filter('status', e.target.value)}><option value="">All statuses</option><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><select className="input w-auto" value={filters.priority} onChange={(e) => filter('priority', e.target.value)}><option value="">All priorities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Ticket</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Open</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading tickets…</td></tr> : tickets.length ? tickets.map((ticket) => { const ticketId = ticket.id ?? ticket._id; return ticketId == null ? <tr key={ticket.title}><td colSpan="6" className="p-4 text-rose-600">A ticket is missing its ID. Refresh the page.</td></tr> : <tr key={ticketId} className="hover:bg-slate-50"><td className="max-w-64 px-4 py-3"><Link className="font-semibold text-slate-800 hover:text-green-700" to={`/tickets/${ticketId}`}>{ticket.title}</Link><p className="mt-1 text-[10px] text-slate-400">{ticket.category}</p></td><td className="px-4 py-3 text-slate-600">{ticket.createdBy?.name}<p className="mt-1 text-[10px] text-slate-400">{ticket.createdBy?.email}</p></td><td className="px-4 py-3"><div className="space-y-2"><StatusBadge status={ticket.status} /><select aria-label={`Change status for ${ticket.title}`} className="input w-32" value={ticket.status} onChange={(e) => update(ticketId, 'status', e.target.value)}><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div></td><td className="px-4 py-3"><div className="space-y-2"><PriorityBadge priority={ticket.priority} /><select aria-label={`Change priority for ${ticket.title}`} className="input w-28" value={ticket.priority} onChange={(e) => update(ticketId, 'priority', e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div></td><td className="px-4 py-3 text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</td><td className="px-4 py-3"><Link to={`/tickets/${ticketId}`} className="font-semibold text-green-700">View →</Link></td></tr>; }) : <tr><td colSpan="6" className="p-8 text-center text-slate-500">No tickets match these filters.</td></tr>}</tbody></table></div>
      {pages > 1 && <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button className="page-button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><button className="page-button" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></div>}
    </section>
  </>;
}
