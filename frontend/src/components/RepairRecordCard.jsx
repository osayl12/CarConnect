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
    <div className="mt-2">
      <button onClick={handleToggle} className="text-xs font-medium text-slate-500 hover:text-slate-700">
        {open ? 'Hide repair record' : 'View repair record'}
      </button>

      {open && (
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          {loading && <p className="text-slate-500">Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && record === null && (
            <p className="text-slate-500">No reports yet for this vehicle.</p>
          )}
          {record && (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-700">Problem</span>
                <StatusBadge status={record.status} />
              </div>
              <p className="text-slate-900">{record.problem}</p>
              {record.latestNote && (
                <p>
                  <span className="font-medium text-slate-700">Latest repair note: </span>
                  {record.latestNote}
                </p>
              )}
              {record.lastAppointment && (
                <p>
                  <span className="font-medium text-slate-700">Last appointment: </span>
                  {new Date(record.lastAppointment.startTime).toLocaleString()} (
                  {record.lastAppointment.status})
                </p>
              )}
              <Link to={`/reports/${record.faultReportId}`} className="inline-block text-slate-900 underline">
                View full report
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
