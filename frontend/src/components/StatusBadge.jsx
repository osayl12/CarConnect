// Section 2.7 status labels/colors — shared by customer and (later) mechanic views.
const STATUS_META = {
  waiting_for_mechanic: { label: 'Waiting for mechanic', className: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under review', className: 'bg-blue-100 text-blue-800' },
  appointment_scheduled: { label: 'Appointment scheduled', className: 'bg-purple-100 text-purple-800' },
  repaired: { label: 'Repaired', className: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', className: 'bg-slate-200 text-slate-700' },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}
