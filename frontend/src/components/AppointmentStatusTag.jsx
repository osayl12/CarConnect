const STATUS_META = {
  available: { label: 'Available', className: 'text-steel' },
  requested: { label: 'Requested', className: 'text-caution-ink' },
  confirmed: { label: 'Confirmed', className: 'text-shop-green' },
  cancelled: { label: 'Cancelled', className: 'text-alert' },
};

export default function AppointmentStatusTag({ status }) {
  const meta = STATUS_META[status] || { label: status, className: 'text-steel' };
  return <span className={`stamp ${meta.className}`}>{meta.label}</span>;
}
