import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

const actionNames = { ticket_created: 'created this ticket', ticket_updated: 'updated this ticket', status_changed: 'changed the status', comment_added: 'added a comment', ticket_resolved: 'resolved this ticket', ticket_deleted: 'deleted this ticket' };

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const ownTicket = ticket && String(ticket.createdBy?.id ?? ticket.createdBy?._id ?? ticket.createdBy) === String(user.id);

  async function load() {
    if (!id || !/^\d+$/.test(id)) { setError('This ticket link is missing a valid ID. Return to your tickets and open it again.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const [ticketResponse, commentResponse, activityResponse] = await Promise.all([api.get(`/tickets/${id}`), api.get(`/tickets/${id}/comments`), api.get(`/tickets/${id}/activity`)]);
      const nextTicket = ticketResponse.data.data.ticket;
      setTicket(nextTicket);
      setForm({ title: nextTicket.title, description: nextTicket.description, category: nextTicket.category, priority: nextTicket.priority });
      setComments(commentResponse.data.data.comments);
      setActivity(activityResponse.data.data.activity);
    } catch (err) { setError(err.response?.data?.message || 'Could not load this ticket.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [id]);

  async function submitComment(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { await api.post(`/tickets/${id}/comments`, { message }); setMessage(''); setSuccess('Reply added.'); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not add your reply.'); }
    finally { setBusy(false); }
  }
  async function saveTicket(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { await api.put(`/tickets/${id}`, form); setEditing(false); setSuccess('Ticket updated.'); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not update the ticket.'); }
    finally { setBusy(false); }
  }
  async function deleteTicket() {
    if (!window.confirm('Delete this ticket and its comments?')) return;
    setBusy(true); setError('');
    try { await api.delete(`/tickets/${id}`); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Could not delete the ticket.'); setBusy(false); }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading ticket…</p>;
  if (!ticket) return <><Link to={user.role === 'admin' ? '/admin/tickets' : '/'} className="mb-6 inline-block text-xs text-slate-500 hover:text-green-700">← Back to tickets</Link><p className="error">{error || 'Ticket not found.'}</p></>;
  const ownerCanEdit = ownTicket && ticket.status !== 'closed';

  return <>
    <Link to={user.role === 'admin' ? '/admin/tickets' : '/'} className="mb-6 inline-block text-xs text-slate-500 hover:text-green-700">← Back to tickets</Link>
    {error && <p className="error mb-4">{error}</p>}{success && <p className="success mb-4">{success}</p>}
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">{ticket.category} · {String(ticket.id ?? ticket._id).slice(-6).toUpperCase()}</p><h1 className="page-title mt-2">{ticket.title}</h1><p className="mt-2 text-xs text-slate-500">Submitted by {ticket.createdBy?.name || 'you'} · {new Date(ticket.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-3"><StatusBadge status={ticket.status} /><PriorityBadge priority={ticket.priority} /></div></div>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="space-y-5">
      <section className="card p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-slate-800">Request details</h2>{ownerCanEdit && !editing && <button className="text-xs font-semibold text-green-700" onClick={() => setEditing(true)}>Edit</button>}</div>
        {editing ? <form className="mt-4 space-y-4" onSubmit={saveTicket}><label className="field-label">Title<input className="input mt-2" required minLength="3" maxLength="120" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className="field-label">Category<input className="input mt-2" required minLength="2" maxLength="60" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label><label className="field-label">Priority<select className="input mt-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="field-label">Description<textarea className="input mt-2" required minLength="10" maxLength="5000" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="flex justify-end gap-2"><button type="button" className="secondary-button" onClick={() => setEditing(false)}>Cancel</button><button disabled={busy} className="button">{busy ? 'Saving…' : 'Save changes'}</button></div></form> : <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p>}
        {ownerCanEdit && !editing && <button disabled={busy} className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-rose-600" onClick={deleteTicket}>{busy ? 'Deleting…' : 'Delete ticket'}</button>}
      </section>
      <section className="card p-5"><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="eyebrow">CONVERSATION</p><h2 className="mt-1 text-sm font-bold text-slate-800">Comments <span className="text-slate-400">({comments.length})</span></h2></div></div>
        <div className="divide-y divide-slate-100">{comments.length ? comments.map((comment) => <article key={comment.id ?? comment._id} className="py-4"><div className="flex items-center gap-2"><strong className="text-xs text-slate-700">{comment.user.name}</strong>{comment.user.role === 'admin' && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">TEAM</span>}<time className="ml-auto text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleString()}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{comment.message}</p></article>) : <p className="py-5 text-xs text-slate-500">No replies yet. Start the conversation below.</p>}</div>
        <form onSubmit={submitComment} className="mt-3"><label className="field-label">Add a reply<textarea className="input mt-2" required maxLength="3000" rows="3" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a reply…" /></label><div className="mt-3 flex justify-end"><button disabled={busy} className="button">{busy ? 'Sending…' : 'Send reply'} →</button></div></form>
      </section>
    </div><aside className="card p-5"><h2 className="text-sm font-bold text-slate-800">Activity</h2><div className="mt-5 space-y-5">{activity.length ? activity.map((item) => <div className="border-l-2 border-green-100 pl-3" key={item.id ?? item._id}><p className="text-xs font-semibold text-slate-700">{item.user?.name || 'Team member'} <span className="font-normal text-slate-500">{actionNames[item.action] || item.details}</span></p><time className="mt-1 block text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</time></div>) : <p className="text-xs text-slate-500">Activity will appear here.</p>}</div></aside></div>
  </>;
}
