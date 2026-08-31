// Echoes the ticket motif in miniature — an empty stack of work orders.
function TicketIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3 text-ink/25">
      <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="8" x2="14" y2="32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="14" cy="14" r="2" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function EmptyState({ title, message, action }) {
  return (
    <div className="rounded-sm border border-dashed border-ink/20 bg-white/60 px-6 py-12 text-center">
      <TicketIcon />
      <p className="font-display text-xl tracking-wide text-ink">{title}</p>
      {message && <p className="mt-1 text-sm text-steel">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
