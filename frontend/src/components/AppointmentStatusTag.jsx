const STATUS_META = {
  available: { label: 'Available', className: 'bg-slate-100 text-slate-600' },
  requested: { label: 'Requested', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
};

export default function AppointmentStatusTag({ status }) {
  const meta = STATUS_META[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}
