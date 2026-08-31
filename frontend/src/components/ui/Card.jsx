// The signature "work-order ticket" surface — a dashed perforated left edge
// with a punch-hole (see .ticket in index.css). Used for anything that
// represents a real record: a vehicle, a fault report, an appointment slot.
export default function Card({ ticket = false, className = '', children, ...props }) {
  return (
    <div
      className={`rounded-sm border border-ink/10 bg-white p-4 shadow-sm ${
        ticket ? 'ticket pl-6' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
