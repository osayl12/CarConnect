import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const initialForm = { name: '', email: '', password: '', role: 'customer', phone: '' };

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm px-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">Get started</p>
      <h1 className="font-display text-4xl tracking-wide text-ink">Create an account</h1>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 2.1: user type selection (customer or mechanic). */}
          <div>
            <span className="text-sm font-semibold text-ink">I am a…</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {['customer', 'mechanic'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  className={`rounded-sm border py-2 text-sm font-semibold capitalize transition-colors ${
                    form.role === role
                      ? 'border-ink bg-ink text-white'
                      : 'border-ink/15 text-steel hover:border-ink/40'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Field label="Full name">
            <Input type="text" name="name" required value={form.name} onChange={handleChange} />
          </Field>

          <Field label="Email">
            <Input type="email" name="email" required value={form.email} onChange={handleChange} />
          </Field>

          <Field label="Phone (optional)">
            <Input type="tel" name="phone" value={form.phone} onChange={handleChange} />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
            />
          </Field>

          {error && <p className="text-sm text-alert">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-sm text-steel">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-signal underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
