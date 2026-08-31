const URGENCY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

export default function UrgencyTag({ urgency }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium capitalize ${
        URGENCY_STYLES[urgency] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {urgency} urgency
    </span>
  );
}
