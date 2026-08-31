import { useEffect, useState } from 'react';
import { listMySlots, createSlot, confirmSlot, cancelSlot } from '../services/appointments';
import AppointmentStatusTag from '../components/AppointmentStatusTag';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { Field, Input } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
      <PageHeader
        eyebrow="Calendar"
        title="My Availability"
        subtitle="Define open time slots. Customers can request one; you approve or cancel it."
      />

      <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3 rounded-sm border border-ink/10 bg-white p-4 shadow-sm">
        <Field label="Start time">
          <Input
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </Field>
        <Field label="Duration (min)">
          <Input
            type="number"
            min="15"
            step="15"
            value={form.durationMinutes}
            onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
            className="w-24"
          />
        </Field>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : '+ Add slot'}
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}
      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}
      {!loading && slots.length === 0 && (
        <div className="mt-6">
          <EmptyState title="No slots yet" message="Add one above to open up your calendar." />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <Card key={slot._id} ticket className="flex items-center justify-between">
            <div>
              <p className="font-mono text-sm font-medium text-ink">
                {new Date(slot.startTime).toLocaleString()} ({slot.durationMinutes} min)
              </p>
              {slot.customer && (
                <p className="text-sm text-steel">
                  {slot.customer.name} — {slot.faultReport?.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <AppointmentStatusTag status={slot.status} />
              {slot.status === 'requested' && (
                <button
                  onClick={() => handleConfirm(slot._id)}
                  className="text-sm font-medium text-shop-green hover:text-shop-green/70"
                >
                  Confirm
                </button>
              )}
              {(slot.status === 'available' || slot.status === 'requested' || slot.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(slot._id)}
                  className="text-sm font-medium text-alert hover:text-alert/70"
                >
                  Cancel
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
