import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFaultReport } from '../services/faults';
import StatusBadge from '../components/StatusBadge';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFaultReport(id)
      .then(setReport)
      .catch((err) => setError(err.response?.data?.message || 'Could not load report'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-slate-500">Loading...</p>;
  if (error) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-red-600">{error}</p>;
  if (!report) return null;

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-10">
      <Link to="/my-reports" className="text-sm text-slate-500 hover:text-slate-700">
        &larr; Back to reports
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {report.vehicle?.year ? `${report.vehicle.year} ` : ''}
            {report.vehicle?.make} {report.vehicle?.model}
          </h1>
          <p className="text-sm text-slate-500">
            Reported {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Description</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{report.description}</p>
        </div>

        {report.errorCode && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Error code</h2>
            <p className="mt-1 text-sm text-slate-900">{report.errorCode}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-slate-700">Urgency</h2>
          <p className="mt-1 text-sm capitalize text-slate-900">{report.urgency}</p>
        </div>

        {report.vehicle?.vin && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">VIN</h2>
            <p className="mt-1 text-sm text-slate-900">{report.vehicle.vin}</p>
          </div>
        )}

        {report.imageUrl && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Photo</h2>
            <img
              src={report.imageUrl}
              alt="Reported issue"
              className="mt-2 max-h-80 rounded-md border border-slate-200"
            />
          </div>
        )}
      </div>
    </div>
  );
}
