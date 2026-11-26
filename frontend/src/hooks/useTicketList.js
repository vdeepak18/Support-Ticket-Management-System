import { useEffect, useState } from 'react';
import api from '../api/axios';
import { errMsg } from '../utils';

function useTicketList(url) {
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ tickets: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
    api.get(url, { params })
      .then((res) => setData(res.data.data))
      .catch((e) => setError(errMsg(e, 'Could not load tickets')))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, filters]);

  const changeFilters = (f) => { setPage(1); setFilters(f); };
  return { filters, setFilters: changeFilters, page, setPage, data, loading, error, reload: load };
}

export default useTicketList;
