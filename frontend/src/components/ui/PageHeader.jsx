export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-4xl tracking-wide text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-steel">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
