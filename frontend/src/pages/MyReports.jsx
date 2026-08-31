import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMyFaultReports } from '../services/faults';
import StatusBadge from '../components/StatusBadge';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Reports</h1>
        <Link
          to="/report-fault"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Report a problem
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {!loading && reports.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No reports yet.</p>
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
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{report.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
