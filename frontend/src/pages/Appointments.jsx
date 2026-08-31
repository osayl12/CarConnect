import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyFaultReports } from '../services/faults';
import { listAvailableSlots, listMyBookings, requestSlot, cancelSlot } from '../services/appointments';
import AppointmentStatusTag from '../components/AppointmentStatusTag';

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
        <p className="text-slate-600">Report a problem first, then you can book an appointment for it.</p>
        <Link to="/report-fault" className="mt-2 inline-block font-medium text-slate-900 underline">
          Report a Problem
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}

      {!loading && (
        <>
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Book a slot</h2>

            <label className="mt-2 block text-sm">
              <span className="font-medium text-slate-700">For which report?</span>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {reports.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.vehicle?.make} {r.vehicle?.model} — {r.description.slice(0, 40)}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 space-y-2">
              {available.length === 0 && (
                <p className="text-sm text-slate-500">No open slots right now — check back later.</p>
              )}
              {available.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(slot.startTime).toLocaleString()} ({slot.durationMinutes} min)
                    </p>
                    <p className="text-xs text-slate-500">with {slot.mechanic?.name}</p>
                  </div>
                  <button
                    onClick={() => handleBook(slot._id)}
                    disabled={bookingId === slot._id}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {bookingId === slot._id ? 'Booking...' : 'Book'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">My Bookings</h2>
            <div className="mt-3 space-y-2">
              {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(b.startTime).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      with {b.mechanic?.name} — {b.faultReport?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AppointmentStatusTag status={b.status} />
                    {(b.status === 'requested' || b.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
