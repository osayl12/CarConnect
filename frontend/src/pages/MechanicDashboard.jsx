import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAllFaultReports } from '../services/faults';
import StatusBadge from '../components/StatusBadge';
import UrgencyTag from '../components/UrgencyTag';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'waiting_for_mechanic', label: 'Waiting for mechanic' },
  { value: 'under_review', label: 'Under review' },
  { value: 'appointment_scheduled', label: 'Appointment scheduled' },
  { value: 'repaired', label: 'Repaired' },
  { value: 'completed', label: 'Completed' },
];

const URGENCY_OPTIONS = [
  { value: '', label: 'All urgencies' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'urgency', label: 'Urgency (high first)' },
];

function Select({ label, value, onChange, options }) {
  return (
    <label className="text-sm">
      <span className="mr-2 font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function MechanicDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', urgency: '', sort: 'newest' });

  useEffect(() => {
    // Refetching from the server whenever filters change, so resetting
    // loading/error here (not derivable during render) is intentional.
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError('');
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.urgency) params.urgency = filters.urgency;
    if (filters.sort) params.sort = filters.sort;

    listAllFaultReports(params)
      .then(setReports)
      .catch(() => setError('Could not load reports'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Incoming Fault Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Filter and sort to decide which request to handle first — the choice is yours.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-3">
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Urgency"
          value={filters.urgency}
          onChange={(v) => setFilters((f) => ({ ...f, urgency: v }))}
          options={URGENCY_OPTIONS}
        />
        <Select
          label="Sort"
          value={filters.sort}
          onChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
          options={SORT_OPTIONS}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {!loading && reports.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No reports match these filters.</p>
      )}

      <div className="mt-6 space-y-3">
        {reports.map((report) => (
          <Link
            key={report._id}
            to={`/reports/${report._id}`}
            className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">
                  {report.vehicle?.year ? `${report.vehicle.year} ` : ''}
                  {report.vehicle?.make} {report.vehicle?.model}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    · {report.customer?.name}
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{report.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {report.errorCode && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                      {report.errorCode}
                    </span>
                  )}
                  <UrgencyTag urgency={report.urgency} />
                  <span className="text-xs text-slate-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
