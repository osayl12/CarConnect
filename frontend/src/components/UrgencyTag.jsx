const URGENCY_META = {
  high: { label: 'High urgency', className: 'text-alert' },
  medium: { label: 'Medium urgency', className: 'text-caution-ink' },
  low: { label: 'Low urgency', className: 'text-steel' },
};

export default function UrgencyTag({ urgency }) {
  const meta = URGENCY_META[urgency] || { label: urgency, className: 'text-steel' };
  return <span className={`stamp ${meta.className}`}>{meta.label}</span>;
}
