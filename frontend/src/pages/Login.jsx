import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { input, btnPrimary } from '../styles';
import { errMsg } from '../utils';
import AuthCard from '../components/AuthCard';
import Field from '../components/Field';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err, 'Login failed. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Log in" footer={<>No account? <Link to="/register" className="text-gray-900 underline">Register</Link></>}>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Email"><input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={input} /></Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className={`${btnPrimary} w-full`}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
    </AuthCard>
  );
}

export default Login;
