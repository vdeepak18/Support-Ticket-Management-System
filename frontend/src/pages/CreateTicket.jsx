import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'General', priority: 'medium' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await api.post('/tickets', form);
      const ticketId = response.data.data.ticket.id ?? response.data.data.ticket._id;
      if (ticketId == null) throw new Error('The server did not return a ticket ID. Refresh and try again.');
      navigate(`/tickets/${ticketId}`, { state: { message: 'Ticket created successfully.' } });
    } catch (err) { setError(err.response?.data?.message || err.message || 'Could not create the ticket.'); }
    finally { setBusy(false); }
  }
  return <div className="max-w-2xl"><Link to="/" className="mb-6 inline-block text-xs text-slate-500 hover:text-green-700">← Back to my tickets</Link><p className="eyebrow">NEW REQUEST</p><h1 className="page-title">How can we help<span className="text-pista">?</span></h1><p className="mb-6 mt-2 text-sm text-slate-500">Share a few details and our team will take it from here.</p>
    <form onSubmit={submit} className="card space-y-5 p-6"><label className="field-label">Title<input className="input mt-2" required minLength="3" maxLength="120" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A short summary of your request" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Category<select className="input mt-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>General</option><option>Technical issue</option><option>Account access</option><option>Billing</option><option>Feature request</option><option>Other</option></select></label><label className="field-label">Priority<select className="input mt-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div><label className="field-label">Description<textarea className="input mt-2" required minLength="10" maxLength="5000" rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Include what you were trying to do and what happened…" /></label>{error && <p className="error">{error}</p>}<div className="flex justify-end gap-3"><Link className="secondary-button" to="/">Cancel</Link><button disabled={busy} className="button">{busy ? 'Sending…' : 'Submit ticket'} →</button></div></form>
  </div>;
}
