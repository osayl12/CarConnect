import { FAULT_STATUS_META } from '../constants/faultStatus';

export default function StatusBadge({ status }) {
  const meta = FAULT_STATUS_META[status] || { label: status, className: 'text-steel' };
  return <span className={`stamp ${meta.className}`}>{meta.label}</span>;
}
