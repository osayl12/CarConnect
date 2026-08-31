import { FAULT_STATUS_META } from '../constants/faultStatus';

export default function StatusBadge({ status }) {
  const meta = FAULT_STATUS_META[status] || { label: status, className: 'bg-slate-100 text-slate-700' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}
