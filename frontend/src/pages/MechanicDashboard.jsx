import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAllFaultReports } from '../services/faults';
import { FAULT_STATUSES, FAULT_STATUS_META } from '../constants/faultStatus';
import StatusBadge from '../components/StatusBadge';
import UrgencyTag from '../components/UrgencyTag';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...FAULT_STATUSES.map((value) => ({ value, label: FAULT_STATUS_META[value].label })),
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

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="text-sm">
      <span className="mr-2 font-mono text-xs font-semibold uppercase tracking-wide text-steel">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-ink/20 bg-white px-2 py-1.5 text-sm text-ink focus:border-signal focus:outline-none"
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
      <PageHeader
        eyebrow="Shop floor"
        title="Incoming Fault Reports"
        subtitle="Filter and sort to decide which request to handle first — the choice is yours."
      />

      <div className="mt-4 flex flex-wrap gap-4 rounded-sm border border-ink/10 bg-white p-3 shadow-sm">
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={STATUS_OPTIONS}
        />
        <FilterSelect
          label="Urgency"
          value={filters.urgency}
          onChange={(v) => setFilters((f) => ({ ...f, urgency: v }))}
          options={URGENCY_OPTIONS}
        />
        <FilterSelect
          label="Sort"
          value={filters.sort}
          onChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
          options={SORT_OPTIONS}
        />
      </div>

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}
      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}
      {!loading && reports.length === 0 && (
        <div className="mt-6">
          <EmptyState title="Nothing here" message="No reports match these filters." />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {reports.map((report) => (
          <Link key={report._id} to={`/reports/${report._id}`} className="block">
            <Card ticket className="hover:border-ink/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-steel">#{report._id.slice(-6).toUpperCase()}</p>
                  <p className="mt-0.5 font-display text-xl tracking-wide text-ink">
                    {report.vehicle?.year ? `${report.vehicle.year} ` : ''}
                    {report.vehicle?.make} {report.vehicle?.model}
                    <span className="ml-2 font-sans text-sm font-normal text-steel">
                      · {report.customer?.name}
                    </span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-steel">{report.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {report.errorCode && (
                      <span className="rounded bg-paper px-2 py-0.5 font-mono text-xs text-steel">
                        {report.errorCode}
                      </span>
                    )}
                    <UrgencyTag urgency={report.urgency} />
                    <span className="font-mono text-xs text-steel/70">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
