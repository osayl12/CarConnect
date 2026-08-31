import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyFaultReports } from '../services/faults';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Card from '../components/ui/Card';
import { buttonClass } from '../components/ui/buttonClass';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyFaultReports()
      .then(setReports)
      .catch(() => setError('Could not load your reports'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        eyebrow="Your tickets"
        title="My Reports"
        action={
          <Link to="/report-fault" className={buttonClass('primary')}>
            + Report a problem
          </Link>
        }
      />

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}
      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}
      {!loading && reports.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No reports yet"
            message="Once you file one, it'll show up here as a ticket you can track."
            action={
              <Link to="/report-fault" className={buttonClass('primary')}>
                + Report a problem
              </Link>
            }
          />
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
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-steel">{report.description}</p>
                  <p className="mt-1 font-mono text-xs text-steel/70">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
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
