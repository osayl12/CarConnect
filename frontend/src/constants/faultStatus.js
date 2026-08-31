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

// text-<x> classes match the stamp-color language shared across all status
// tags in the app: steel = pending, caution-ink = attention, signal = active,
// shop-green = positive/done, ink = fully closed.
export const FAULT_STATUS_META = {
  waiting_for_mechanic: { label: 'Waiting for mechanic', className: 'text-steel' },
  under_review: { label: 'Under review', className: 'text-signal' },
  appointment_scheduled: { label: 'Appointment scheduled', className: 'text-caution-ink' },
  repaired: { label: 'Repaired', className: 'text-shop-green' },
  completed: { label: 'Completed', className: 'text-ink' },
};
