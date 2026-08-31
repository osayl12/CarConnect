const fieldClass =
  'mt-1 w-full rounded-sm border border-ink/20 bg-white px-3 py-2 text-sm text-ink placeholder:text-steel/50 focus:border-signal focus:outline-none';

export function Field({ label, hint, className = '', children }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-steel">{hint}</span>}
    </label>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}
