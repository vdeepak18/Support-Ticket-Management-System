import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const account = await login(form); navigate(account.role === 'admin' ? '/admin' : '/'); }
    catch (err) { setError(err.response?.status === 401 ? 'Email or password is incorrect. Accounts from the old MongoDB database were not copied to PostgreSQL; register again. Admin accounts must be created with npm run seed:admin.' : err.response?.data?.message || 'Could not sign in. Check that the API is running.'); }
    finally { setBusy(false); }
  }
  return <AuthCard title="Welcome back" subtitle="Sign in to see your support requests."><form onSubmit={submit} className="space-y-4"><Field label="Email"><input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field><Field label="Password"><input className="input" type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" /></Field>{error && <p className="error">{error}</p>}<button disabled={busy} className="button w-full">{busy ? 'Signing in…' : 'Sign in'} →</button></form><p className="mt-5 text-center text-xs text-slate-500">New here? <Link className="font-semibold text-green-700" to="/register">Create an account</Link></p></AuthCard>;
}

export function AuthCard({ title, subtitle, children }) {
  return <div className="grid min-h-screen place-items-center bg-[#f5f7f5] p-5"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-9"><div className="mb-8 flex items-center gap-3 font-bold text-slate-800"><span className="grid h-9 w-9 place-items-center rounded-xl bg-green-100 text-xl text-green-700">k</span> kindred / support</div><p className="eyebrow">WELCOME</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{title}</h1><p className="mb-7 mt-2 text-sm text-slate-500">{subtitle}</p>{children}</div></div>;
}
export function Field({ label, children }) { return <label className="block text-xs font-semibold text-slate-600">{label}<span className="mt-1.5 block">{children}</span></label>; }
