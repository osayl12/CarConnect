import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFaultReport, respondWithQuote } from '../services/faults';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/StatusBadge';
import UrgencyTag from '../components/UrgencyTag';
import QuoteForm from '../components/QuoteForm';

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    getFaultReport(id)
      .then(setReport)
      .catch((err) => setError(err.response?.data?.message || 'Could not load report'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleQuoteSubmit = async (payload) => {
    setQuoteSubmitting(true);
    setQuoteError('');
    try {
      setReport(await respondWithQuote(id, payload));
    } catch (err) {
      setQuoteError(err.response?.data?.message || 'Could not send response');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-slate-500">Loading...</p>;
  if (error) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-red-600">{error}</p>;
  if (!report) return null;

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-10">
      <Link
        to={user?.role === 'mechanic' ? '/mechanic' : '/my-reports'}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
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
        {/* Section 2.4: mechanic can see customer info. Not shown to the
            customer viewing their own report — it's just their own details. */}
        {user?.role === 'mechanic' && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Reported by</h2>
            <p className="mt-1 text-sm text-slate-900">{report.customer?.name}</p>
            <p className="text-sm text-slate-500">
              {[report.customer?.email, report.customer?.phone].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

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
          <div className="mt-1">
            <UrgencyTag urgency={report.urgency} />
          </div>
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

      {/* Section 2.5: the mechanic's response is shown to the customer too. */}
      {report.quote && (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-700">Mechanic's Response</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Estimated price</p>
              <p className="text-sm font-medium text-slate-900">${report.quote.price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Estimated repair time</p>
              <p className="text-sm font-medium text-slate-900">{report.quote.estimatedTime}</p>
            </div>
          </div>
          {report.quote.parts?.length > 0 && (
            <div>
              <p className="text-xs text-slate-500">Parts / equipment</p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-900">
                {report.quote.parts.map((part) => (
                  <li key={part}>{part}</li>
                ))}
              </ul>
            </div>
          )}
          {report.quote.notes && (
            <div>
              <p className="text-xs text-slate-500">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-slate-900">{report.quote.notes}</p>
            </div>
          )}
          <p className="text-xs text-slate-400">
            Responded {new Date(report.quote.respondedAt).toLocaleString()}
          </p>
        </div>
      )}

      {user?.role === 'mechanic' && (
        <div className="mt-4">
          {quoteError && <p className="mb-2 text-sm text-red-600">{quoteError}</p>}
          <QuoteForm
            key={report.quote ? 'edit' : 'new'}
            initialQuote={report.quote}
            onSubmit={handleQuoteSubmit}
            submitting={quoteSubmitting}
          />
        </div>
      )}
    </div>
  );
}
