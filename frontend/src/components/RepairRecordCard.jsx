import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getRepairRecord } from '../services/vehicles';
import StatusBadge from './StatusBadge';

// Section 2.10: basic repair record — current status, latest repair note,
// last appointment, problem description. Fetched lazily so adding a vehicle
// with no reports yet doesn't cost an extra request.
export default function RepairRecordCard({ vehicleId }) {
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState(undefined); // undefined = not fetched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = () => {
    if (!open && record === undefined) {
      setLoading(true);
      getRepairRecord(vehicleId)
        .then(setRecord)
        .catch(() => setError('Could not load repair record'))
        .finally(() => setLoading(false));
    }
    setOpen((o) => !o);
  };

  return (
    <div className="mt-3 border-t border-ink/10 pt-3">
      <button onClick={handleToggle} className="text-xs font-semibold text-steel hover:text-ink">
        {open ? 'Hide repair record' : 'View repair record'}
      </button>

      {open && (
        <div className="mt-2 rounded-sm bg-paper p-3 text-sm">
          {loading && <p className="text-steel">Loading…</p>}
          {error && <p className="text-alert">{error}</p>}
          {!loading && record === null && <p className="text-steel">No reports yet for this vehicle.</p>}
          {record && (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-ink">Problem</span>
                <StatusBadge status={record.status} />
              </div>
              <p className="text-ink">{record.problem}</p>
              {record.latestNote && (
                <p>
                  <span className="font-semibold text-ink">Latest repair note: </span>
                  <span className="text-steel">{record.latestNote}</span>
                </p>
              )}
              {record.lastAppointment && (
                <p>
                  <span className="font-semibold text-ink">Last appointment: </span>
                  <span className="font-mono text-steel">
                    {new Date(record.lastAppointment.startTime).toLocaleString()} (
                    {record.lastAppointment.status})
                  </span>
                </p>
              )}
              <Link to={`/reports/${record.faultReportId}`} className="inline-block font-semibold text-signal underline">
                View full report
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
