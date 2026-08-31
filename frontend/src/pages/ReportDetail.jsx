import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFaultReport, respondWithQuote, updateFaultStatus } from '../services/faults';
import { useAuth } from '../hooks/useAuth';
import { FAULT_STATUSES, FAULT_STATUS_META } from '../constants/faultStatus';
import StatusBadge from '../components/StatusBadge';
import UrgencyTag from '../components/UrgencyTag';
import QuoteForm from '../components/QuoteForm';
import Card from '../components/ui/Card';

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');

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

  const handleStatusChange = async (status) => {
    setStatusSaving(true);
    setStatusError('');
    try {
      setReport(await updateFaultStatus(id, status));
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Could not update status');
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-steel">Loading…</p>;
  if (error) return <p className="mx-auto mt-10 max-w-2xl px-4 text-sm text-alert">{error}</p>;
  if (!report) return null;

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 pb-10">
      <Link
        to={user?.role === 'mechanic' ? '/mechanic' : '/my-reports'}
        className="text-sm text-steel hover:text-ink"
      >
        &larr; Back to reports
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-steel">#{report._id.slice(-6).toUpperCase()}</p>
          <h1 className="mt-0.5 font-display text-4xl tracking-wide text-ink">
            {report.vehicle?.year ? `${report.vehicle.year} ` : ''}
            {report.vehicle?.make} {report.vehicle?.model}
          </h1>
          <p className="mt-1 font-mono text-xs text-steel">
            Reported {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        {/* Section 2.7: mechanic can update the status directly; the
            customer just sees the current one. */}
        {user?.role === 'mechanic' ? (
          <label className="text-sm">
            <span className="sr-only">Status</span>
            <select
              value={report.status}
              disabled={statusSaving}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-sm border border-ink/20 bg-white px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink focus:border-signal focus:outline-none disabled:opacity-50"
            >
              {FAULT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {FAULT_STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <StatusBadge status={report.status} />
        )}
      </div>
      {statusError && <p className="mt-2 text-sm text-alert">{statusError}</p>}

      <Card ticket className="mt-6 space-y-4 p-5">
        {/* Section 2.4: mechanic can see customer info. Not shown to the
            customer viewing their own report — it's just their own details. */}
        {user?.role === 'mechanic' && (
          <div>
            <h2 className="text-sm font-semibold text-ink">Reported by</h2>
            <p className="mt-1 text-sm text-ink">{report.customer?.name}</p>
            <p className="text-sm text-steel">
              {[report.customer?.email, report.customer?.phone].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-ink">Description</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{report.description}</p>
        </div>

        {report.errorCode && (
          <div>
            <h2 className="text-sm font-semibold text-ink">Error code</h2>
            <p className="mt-1 font-mono text-sm text-ink">{report.errorCode}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-ink">Urgency</h2>
          <div className="mt-1">
            <UrgencyTag urgency={report.urgency} />
          </div>
        </div>

        {report.vehicle?.vin && (
          <div>
            <h2 className="text-sm font-semibold text-ink">VIN</h2>
            <p className="mt-1 font-mono text-sm text-ink">{report.vehicle.vin}</p>
          </div>
        )}

        {report.imageUrl && (
          <div>
            <h2 className="text-sm font-semibold text-ink">Photo</h2>
            <img
              src={report.imageUrl}
              alt="Reported issue"
              className="mt-2 max-h-80 rounded-sm border border-ink/10"
            />
          </div>
        )}
      </Card>

      {/* Section 2.5: the mechanic's response is shown to the customer too. */}
      {report.quote && (
        <Card className="mt-4 space-y-3 p-5">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">
            Mechanic's Response
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-steel">Estimated price</p>
              <p className="font-mono text-lg font-medium text-ink">
                ${report.quote.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-steel">Estimated repair time</p>
              <p className="text-sm font-medium text-ink">{report.quote.estimatedTime}</p>
            </div>
          </div>
          {report.quote.parts?.length > 0 && (
            <div>
              <p className="text-xs text-steel">Parts / equipment</p>
              <ul className="mt-1 list-inside list-disc text-sm text-ink">
                {report.quote.parts.map((part) => (
                  <li key={part}>{part}</li>
                ))}
              </ul>
            </div>
          )}
          {report.quote.notes && (
            <div>
              <p className="text-xs text-steel">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-ink">{report.quote.notes}</p>
            </div>
          )}
          <p className="font-mono text-xs text-steel/70">
            Responded {new Date(report.quote.respondedAt).toLocaleString()}
          </p>
        </Card>
      )}

      {user?.role === 'mechanic' && (
        <div className="mt-4">
          {quoteError && <p className="mb-2 text-sm text-alert">{quoteError}</p>}
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
