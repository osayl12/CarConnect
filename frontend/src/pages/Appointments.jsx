import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyFaultReports } from '../services/faults';
import { listAvailableSlots, listMyBookings, requestSlot, cancelSlot } from '../services/appointments';
import AppointmentStatusTag from '../components/AppointmentStatusTag';
import PageHeader from '../components/ui/PageHeader';
import { Field, Select } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Appointments() {
  const [reports, setReports] = useState([]);
  const [available, setAvailable] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);

  const load = () => {
    // Also called after booking/cancelling to refresh — not just on mount —
    // so resetting loading here is intentional.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    Promise.all([listMyFaultReports(), listAvailableSlots(), listMyBookings()])
      .then(([r, a, b]) => {
        setReports(r);
        setAvailable(a);
        setBookings(b);
        if (r.length > 0) setSelectedReport((prev) => prev || r[0]._id);
      })
      .catch(() => setError('Could not load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleBook = async (slotId) => {
    if (!selectedReport) return;
    setError('');
    setBookingId(slotId);
    try {
      await requestSlot(slotId, selectedReport);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not book this slot');
    } finally {
      setBookingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelSlot(id);
      load();
    } catch {
      setError('Could not cancel');
    }
  };

  if (!loading && reports.length === 0) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4 text-center">
        <p className="text-steel">Report a problem first, then you can book an appointment for it.</p>
        <Link to="/report-fault" className="mt-2 inline-block font-semibold text-signal underline">
          Report a Problem
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader eyebrow="Bookings" title="Appointments" />

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}
      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && (
        <>
          <section className="mt-6">
            <h2 className="font-display text-xl tracking-wide text-ink">Book a slot</h2>

            <Field label="For which report?" className="mt-2">
              <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
                {reports.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.vehicle?.make} {r.vehicle?.model} — {r.description.slice(0, 40)}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="mt-3 space-y-2">
              {available.length === 0 && (
                <p className="text-sm text-steel">No open slots right now — check back later.</p>
              )}
              {available.map((slot) => (
                <Card key={slot._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">
                      {new Date(slot.startTime).toLocaleString()} ({slot.durationMinutes} min)
                    </p>
                    <p className="text-xs text-steel">with {slot.mechanic?.name}</p>
                  </div>
                  <Button onClick={() => handleBook(slot._id)} disabled={bookingId === slot._id} className="px-3 py-1.5 text-xs">
                    {bookingId === slot._id ? 'Booking…' : 'Book'}
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-xl tracking-wide text-ink">My Bookings</h2>
            <div className="mt-3 space-y-2">
              {bookings.length === 0 && <p className="text-sm text-steel">No bookings yet.</p>}
              {bookings.map((b) => (
                <Card key={b._id} ticket className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium text-ink">
                      {new Date(b.startTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-steel">
                      with {b.mechanic?.name} — {b.faultReport?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AppointmentStatusTag status={b.status} />
                    {(b.status === 'requested' || b.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="text-sm font-medium text-alert hover:text-alert/70"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
