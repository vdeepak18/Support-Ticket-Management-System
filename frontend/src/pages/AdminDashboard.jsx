import { useEffect, useState } from 'react';
import api from '../api/axios';
import { errMsg } from '../utils';
import StatCard from '../components/StatCard';
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/api/admin/stats').then((r) => setStats(r.data.data)).catch((e) => setError(errMsg(e, 'Could not load stats')));
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-sm text-gray-500">Loading stats...</p>;
  const by = (obj, key) => obj?.[key] ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={by(stats.byStatus, 'open')} />
        <StatCard label="In progress" value={by(stats.byStatus, 'in-progress')} />
        <StatCard label="Resolved" value={by(stats.byStatus, 'resolved')} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">By priority</h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="High" value={by(stats.byPriority, 'high')} />
          <StatCard label="Medium" value={by(stats.byPriority, 'medium')} />
          <StatCard label="Low" value={by(stats.byPriority, 'low')} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
