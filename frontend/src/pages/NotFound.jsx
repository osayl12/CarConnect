import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui/buttonClass';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-4 text-center">
      <p className="stamp text-alert">404</p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-ink">Page not found</h1>
      <p className="mt-1 text-steel">This ticket doesn't exist.</p>
      <Link to="/" className={buttonClass('primary', 'mt-6')}>
        Back to home
      </Link>
    </div>
  );
}
