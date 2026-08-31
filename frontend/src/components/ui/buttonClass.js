const VARIANTS = {
  primary: 'bg-signal text-white hover:bg-signal-dark',
  secondary: 'bg-white text-ink border border-ink/15 hover:border-ink/40',
  // For a secondary action sitting directly on the dark hero — no bg-* class
  // at all, so it can never conflict with `secondary`'s bg-white.
  outlineOnDark: 'border border-white/30 text-white hover:border-white',
  ghost: 'text-steel hover:text-ink',
  danger: 'text-alert hover:text-alert/70',
};

// Shared between <Button> and other elements (e.g. <Link>) that need
// identical styling — see Navbar/Home's CTA links.
export function buttonClass(variant = 'primary', className = '') {
  return `inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`;
}
