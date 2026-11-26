import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { input, btnPrimary } from '../styles';
import { errMsg } from '../utils';
import AuthCard from '../components/AuthCard';
import Field from '../components/Field';
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err, 'Registration failed. Try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Create account" footer={<>Have an account? <Link to="/login" className="text-gray-900 underline">Log in</Link></>}>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field label="Name"><input name="name" autoComplete="name" required value={form.name} onChange={change} className={input} /></Field>
        <Field label="Email"><input name="email" type="email" autoComplete="email" required value={form.email} onChange={change} className={input} /></Field>
        <Field label="Password"><input name="password" type="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={change} className={input} /></Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className={`${btnPrimary} w-full`}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
    </AuthCard>
  );
}

export default Register;
