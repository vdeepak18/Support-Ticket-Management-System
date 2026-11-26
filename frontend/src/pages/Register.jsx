import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthCard, Field } from './Login';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Could not create your account.'); }
    finally { setBusy(false); }
  }
  return <AuthCard title="Create your account" subtitle="A better support experience starts here."><form onSubmit={submit} className="space-y-4"><Field label="Name"><input className="input" autoComplete="name" required minLength="2" maxLength="80" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" /></Field><Field label="Email"><input className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field><Field label="Password"><input className="input" type="password" autoComplete="new-password" required minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></Field>{error && <p className="error">{error}</p>}<button disabled={busy} className="button w-full">{busy ? 'Creating account…' : 'Create account'} →</button></form><p className="mt-5 text-center text-xs text-slate-500">Already have an account? <Link className="font-semibold text-green-700" to="/login">Sign in</Link></p></AuthCard>;
}
