import { useState } from 'react';
import { Field, Input, Textarea } from './ui/Field';
import Button from './ui/Button';

// Section 2.5: mechanic's repair response — price, time, parts, notes.
// Note: the parent renders this with key={report._id}, so switching to a
// different report mounts a fresh instance instead of needing an effect to
// re-sync state on prop changes (same pattern as VehicleForm).
export default function QuoteForm({ initialQuote, onSubmit, submitting }) {
  const [form, setForm] = useState({
    price: initialQuote?.price ?? '',
    estimatedTime: initialQuote?.estimatedTime ?? '',
    parts: initialQuote?.parts?.join('\n') ?? '',
    notes: initialQuote?.notes ?? '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.price || !form.estimatedTime) {
      setError('Estimated price and repair time are required');
      return;
    }
    onSubmit({
      price: Number(form.price),
      estimatedTime: form.estimatedTime,
      parts: form.parts.split('\n').map((p) => p.trim()).filter(Boolean),
      notes: form.notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-sm border border-ink/10 bg-white p-4 shadow-sm">
      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">
        {initialQuote ? 'Update your response' : 'Send a repair response'}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Estimated price ($)">
          <Input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="font-mono"
          />
        </Field>

        <Field label="Estimated repair time">
          <Input
            type="text"
            name="estimatedTime"
            placeholder="e.g. 2 days"
            value={form.estimatedTime}
            onChange={handleChange}
          />
        </Field>
      </div>

      <Field label="Parts / equipment needed (one per line, optional)">
        <Textarea
          name="parts"
          rows={3}
          value={form.parts}
          onChange={handleChange}
          placeholder={'Brake pads\nRotor'}
        />
      </Field>

      <Field label="Repair notes (optional)">
        <Textarea name="notes" rows={3} value={form.notes} onChange={handleChange} />
      </Field>

      {error && <p className="text-sm text-alert">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : initialQuote ? 'Update response' : 'Send response'}
      </Button>
    </form>
  );
}
