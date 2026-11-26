import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { input, btn, btnPrimary, card } from '../styles';
import { errMsg, fmt } from '../utils';
import Badge from '../components/Badge';
import Field from '../components/Field';
function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [t, c, a] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get(`/api/tickets/${id}/comments`),
        api.get(`/api/tickets/${id}/activity`),
      ]);
      setTicket(t.data.data.ticket);
      setComments(c.data.data.comments);
      setActivity(a.data.data.activity);
    } catch (e) {
      setError(errMsg(e, 'Could not load this ticket'));
    }
  };
  useEffect(() => { load(); }, [id]);

  if (error && !ticket) return <p className="text-sm text-red-600">{error}</p>;
  if (!ticket) return <p className="text-sm text-gray-500">Loading ticket...</p>;

  // Only the owner sees Edit/Delete (the backend enforces this too)
  const isOwner = (ticket.createdBy?._id || ticket.createdBy) === user.id;

  const startEdit = () => {
    setForm({ title: ticket.title, description: ticket.description, category: ticket.category, priority: ticket.priority });
    setEditing(true);
  };
  const run = async (action, okMessage) => {
    setError('');
    setSuccess('');
    try {
      await action();
      setSuccess(okMessage);
      await load();
    } catch (e) {
      setError(errMsg(e, 'Something went wrong'));
    }
  };
  const saveEdit = (e) => {
    e.preventDefault();
    run(async () => { await api.put(`/api/tickets/${id}`, form); setEditing(false); }, 'Ticket updated');
  };
  const postComment = (e) => {
    e.preventDefault();
    run(async () => { await api.post(`/api/tickets/${id}/comments`, { message }); setMessage(''); }, 'Comment posted');
  };
  const remove = async () => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await api.delete(`/api/tickets/${id}`);
      navigate('/');
    } catch (e) {
      setError(errMsg(e, 'Could not delete the ticket'));
    }
  };
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      <Link to={user.role === 'admin' ? '/admin/tickets' : '/'} className="text-sm text-gray-500 hover:underline">Back to tickets</Link>
      <div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{ticket.title}</h1>
          <div className="flex gap-2 shrink-0"><Badge value={ticket.status} /><Badge value={ticket.priority} /></div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Created by {ticket.createdBy?.name || 'user'} on {fmt(ticket.createdAt)}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <section className={card}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          {isOwner && !editing && (
            <div className="flex gap-4 text-sm">
              <button onClick={startEdit} className="text-gray-900 hover:underline">Edit</button>
              <button onClick={remove} className="text-red-600 hover:underline">Delete</button>
            </div>
          )}
        </div>
        {editing ? (
          <form onSubmit={saveEdit} className="space-y-4">
            <Field label="Title"><input name="title" required value={form.title} onChange={set} className={input} /></Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Category"><input name="category" value={form.category} onChange={set} className={input} /></Field>
              <Field label="Priority">
                <select name="priority" value={form.priority} onChange={set} className={input}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </Field>
            </div>
            <Field label="Description"><textarea name="description" required value={form.description} onChange={set} className={`${input} min-h-[120px]`} /></Field>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className={btn}>Cancel</button>
              <button className={btnPrimary}>Save changes</button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        )}
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Comments ({comments.length})</h2>
        {comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
        {comments.map((c) => (
          <div key={c._id} className="py-3 border-b border-gray-200 text-sm">
            <p><span className="font-medium text-gray-900">{c.user?.name || 'User'}</span> <span className="text-gray-500">{fmt(c.createdAt)}</span></p>
            <p className="text-gray-700 whitespace-pre-wrap">{c.message}</p>
          </div>
        ))}
        <form onSubmit={postComment} className="mt-4 space-y-2">
          <Field label="Add a comment"><textarea required value={message} onChange={(e) => setMessage(e.target.value)} className={`${input} min-h-[80px]`} /></Field>
          <div className="text-right"><button className={btnPrimary}>Post comment</button></div>
        </form>
      </section>

      <section className={card}>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Activity</h2>
        {activity.length === 0 && <p className="text-sm text-gray-500">No activity yet.</p>}
        {activity.map((a) => (
          <p key={a._id} className="py-2 border-b border-gray-200 last:border-0 text-sm text-gray-700">
            <span className="font-medium text-gray-900">{a.user?.name || 'User'}</span> {a.details || a.action.replace(/_/g, ' ')}{' '}
            <span className="text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
          </p>
        ))}
      </section>
    </div>
  );
}

export default TicketDetail;
