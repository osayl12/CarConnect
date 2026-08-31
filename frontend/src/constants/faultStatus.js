// Section 2.7: basic status tracking. Single source of truth for the status
// list/labels on the frontend — mirrors FaultReport.STATUSES on the backend
// (backend/src/models/FaultReport.js).
export const FAULT_STATUSES = [
  'waiting_for_mechanic',
  'under_review',
  'appointment_scheduled',
  'repaired',
  'completed',
];

export const FAULT_STATUS_META = {
  waiting_for_mechanic: { label: 'Waiting for mechanic', className: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under review', className: 'bg-blue-100 text-blue-800' },
  appointment_scheduled: { label: 'Appointment scheduled', className: 'bg-purple-100 text-purple-800' },
  repaired: { label: 'Repaired', className: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', className: 'bg-slate-200 text-slate-700' },
};
