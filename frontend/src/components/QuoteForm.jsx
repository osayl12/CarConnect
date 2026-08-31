import { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-700">
        {initialQuote ? 'Update your response' : 'Send a repair response'}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Estimated price ($)</span>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700">Estimated repair time</span>
          <input
            type="text"
            name="estimatedTime"
            placeholder="e.g. 2 days"
            value={form.estimatedTime}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Parts / equipment needed (one per line, optional)</span>
        <textarea
          name="parts"
          rows={3}
          value={form.parts}
          onChange={handleChange}
          placeholder={'Brake pads\nRotor'}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Repair notes (optional)</span>
        <textarea
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {submitting ? 'Sending...' : initialQuote ? 'Update response' : 'Send response'}
      </button>
    </form>
  );
}
