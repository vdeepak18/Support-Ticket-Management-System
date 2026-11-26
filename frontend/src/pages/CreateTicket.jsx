import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { input, btn, btnPrimary, card } from '../styles';
import { errMsg } from '../utils';
import Field from '../components/Field';
function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: 'General', priority: 'medium', description: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/api/tickets', form);
      navigate(`/tickets/${res.data.data.ticket.id}`);
    } catch (err) {
      setError(errMsg(err, 'Could not create the ticket'));
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">New ticket</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">Describe the problem and we will follow up.</p>
      <form onSubmit={submit} className={`${card} space-y-4`}>
        <Field label="Title"><input name="title" required value={form.title} onChange={change} placeholder="Short summary of the problem" className={input} /></Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Category">
            <select name="category" value={form.category} onChange={change} className={input}>
              <option>General</option><option>Billing</option><option>Technical</option><option>Account</option>
            </select>
          </Field>
          <Field label="Priority">
            <select name="priority" value={form.priority} onChange={change} className={input}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea name="description" required value={form.description} onChange={change} placeholder="What were you trying to do, and what happened?" className={`${input} min-h-[120px]`} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Link to="/" className={btn}>Cancel</Link>
          <button disabled={busy} className={btnPrimary}>{busy ? 'Submitting...' : 'Submit ticket'}</button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
