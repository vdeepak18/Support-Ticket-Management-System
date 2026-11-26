import { input } from '../styles';
import Field from './Field';

function TicketFilters({ filters, setFilters }) {
  const change = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-2">
        <Field label="Search"><input name="search" value={filters.search} onChange={change} placeholder="Search by title" className={input} /></Field>
      </div>
      <Field label="Status">
        <select name="status" value={filters.status} onChange={change} className={input}>
          <option value="">All</option><option value="open">Open</option><option value="in-progress">In progress</option>
          <option value="resolved">Resolved</option><option value="closed">Closed</option>
        </select>
      </Field>
      <Field label="Priority">
        <select name="priority" value={filters.priority} onChange={change} className={input}>
          <option value="">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
      </Field>
    </div>
  );
}

export default TicketFilters;
