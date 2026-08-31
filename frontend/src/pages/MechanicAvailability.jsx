import { useEffect, useState } from 'react';
import { listMySlots, createSlot, confirmSlot, cancelSlot } from '../services/appointments';
import AppointmentStatusTag from '../components/AppointmentStatusTag';

function toLocalInputValue(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export default function MechanicAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Lazy initializer: computed once on mount, not re-evaluated every render.
  const [form, setForm] = useState(() => ({
    startTime: toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
    durationMinutes: 60,
  }));
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    // Also called after create/confirm/cancel to refresh — not just on
    // mount — so resetting loading here is intentional.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    listMySlots()
      .then(setSlots)
      .catch(() => setError('Could not load your slots'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createSlot({
        startTime: new Date(form.startTime).toISOString(),
        durationMinutes: Number(form.durationMinutes),
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await confirmSlot(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not confirm appointment');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment slot?')) return;
    try {
      await cancelSlot(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">My Availability</h1>
      <p className="mt-1 text-sm text-slate-500">
        Define open time slots. Customers can request one; you approve or cancel it.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="block font-medium text-slate-700">Start time</span>
          <input
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium text-slate-700">Duration (min)</span>
          <input
            type="number"
            min="15"
            step="15"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            className="mt-1 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : '+ Add slot'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {!loading && slots.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No slots yet. Add one above.</p>
      )}

      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">
                {new Date(slot.startTime).toLocaleString()} ({slot.durationMinutes} min)
              </p>
              {slot.customer && (
                <p className="text-sm text-slate-500">
                  {slot.customer.name} — {slot.faultReport?.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <AppointmentStatusTag status={slot.status} />
              {slot.status === 'requested' && (
                <button
                  onClick={() => handleConfirm(slot._id)}
                  className="text-sm font-medium text-green-700 hover:text-green-900"
                >
                  Confirm
                </button>
              )}
              {(slot.status === 'available' || slot.status === 'requested' || slot.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(slot._id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
