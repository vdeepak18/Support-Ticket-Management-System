import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { btnPrimary, card } from '../styles';
import { fmt } from '../utils';
import useTicketList from '../hooks/useTicketList';
import StatCard from '../components/StatCard';
import TicketFilters from '../components/TicketFilters';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
function Dashboard() {
  const list = useTicketList('/api/tickets');
  const [stats, setStats] = useState([]);

  // Three small requests: only the "total" of each is used
  useEffect(() => {
    Promise.all(['', 'open', 'resolved'].map((status) => api.get('/api/tickets', { params: { limit: 1, status: status || undefined } })))
      .then((res) => setStats(res.map((r) => r.data.data.total)))
      .catch(() => {});
  }, []);

  const { tickets, pages } = list.data;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">My tickets</h1>
        <Link to="/tickets/new" className={btnPrimary}>New ticket</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total" value={stats[0]} />
        <StatCard label="Open" value={stats[1]} />
        <StatCard label="Resolved" value={stats[2]} />
      </div>
      <TicketFilters filters={list.filters} setFilters={list.setFilters} />
      {list.error && <p className="text-sm text-red-600">{list.error}</p>}
      <div className={`${card} p-0 overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
              <th className="px-3 py-2">Title</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Priority</th><th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id} className="border-b border-gray-200 last:border-0">
                <td className="px-3 py-3"><Link to={`/tickets/${t._id}`} className="text-gray-900 hover:underline">{t.title}</Link></td>
                <td className="px-3 py-3"><Badge value={t.status} /></td>
                <td className="px-3 py-3"><Badge value={t.priority} /></td>
                <td className="px-3 py-3 text-gray-500">{fmt(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.loading && <p className="p-4 text-sm text-gray-500">Loading tickets...</p>}
        {!list.loading && tickets.length === 0 && <p className="p-4 text-sm text-gray-500">No tickets found. <Link to="/tickets/new" className="underline">Create one</Link>.</p>}
      </div>
      <Pagination page={list.page} pages={pages} setPage={list.setPage} />
    </div>
  );
}

export default Dashboard;
