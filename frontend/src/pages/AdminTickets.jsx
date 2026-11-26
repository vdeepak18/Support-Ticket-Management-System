import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { card } from '../styles';
import { errMsg } from '../utils';
import useTicketList from '../hooks/useTicketList';
import TicketFilters from '../components/TicketFilters';
import Pagination from '../components/Pagination';
function AdminTickets() {
  const list = useTicketList('/api/admin/tickets');
  const [error, setError] = useState('');
  const { tickets, pages } = list.data;
  const small = 'border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#74C365]';

  // Change status or priority, then reload the list
  const update = async (id, field, value) => {
    setError('');
    try {
      await api.patch(`/api/admin/tickets/${id}/${field}`, { [field]: value });
      list.reload();
    } catch (e) {
      setError(errMsg(e, `Could not update ${field}`));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">All tickets</h1>
      <TicketFilters filters={list.filters} setFilters={list.setFilters} />
      {(error || list.error) && <p className="text-sm text-red-600">{error || list.error}</p>}
      <div className={`${card} p-0 overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
              <th className="px-3 py-2">Title</th><th className="px-3 py-2">User</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Priority</th><th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t._id} className="border-b border-gray-200 last:border-0">
                <td className="px-3 py-3 text-gray-900">{t.title}</td>
                <td className="px-3 py-3 text-gray-500">{t.createdBy?.name || '-'}</td>
                <td className="px-3 py-3">
                  <select aria-label="Status" value={t.status} onChange={(e) => update(t._id, 'status', e.target.value)} className={small}>
                    <option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                  </select>
                </td>
                <td className="px-3 py-3">
                  <select aria-label="Priority" value={t.priority} onChange={(e) => update(t._id, 'priority', e.target.value)} className={small}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </td>
                <td className="px-3 py-3"><Link to={`/tickets/${t._id}`} className="text-gray-900 hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.loading && <p className="p-4 text-sm text-gray-500">Loading tickets...</p>}
        {!list.loading && tickets.length === 0 && <p className="p-4 text-sm text-gray-500">No tickets found.</p>}
      </div>
      <Pagination page={list.page} pages={pages} setPage={list.setPage} />
    </div>
  );
}

export default AdminTickets;
