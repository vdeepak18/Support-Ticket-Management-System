import { btn } from '../styles';

function Pagination({ page, pages, setPage }) {
  return (
    <div className="flex items-center justify-between">
      <button className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span className="text-sm text-gray-500">Page {page} of {pages || 1}</span>
      <button className={btn} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}

export default Pagination;
