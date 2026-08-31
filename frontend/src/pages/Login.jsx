import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">Welcome back</p>
      <h1 className="font-display text-4xl tracking-wide text-ink">Log in</h1>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input type="email" name="email" required value={form.email} onChange={handleChange} />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </Field>

          {error && <p className="text-sm text-alert">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-sm text-steel">
        No account?{' '}
        <Link to="/register" className="font-semibold text-signal underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
