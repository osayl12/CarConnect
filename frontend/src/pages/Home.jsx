import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { buttonClass } from '../components/ui/buttonClass';

const STEPS = [
  {
    n: '01',
    title: 'Report it',
    body: 'Describe the problem, attach a photo and the error code if you have one.',
  },
  {
    n: '02',
    title: 'Quote it',
    body: 'A mechanic reviews it and sends back a price, timeline, and parts needed.',
  },
  {
    n: '03',
    title: 'Fix it',
    body: 'Book the appointment, track the status, done — no chasing phone calls.',
  },
];

function HeroCTA({ user }) {
  if (!user) {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/register" className={buttonClass('primary', 'px-6 py-3')}>
          Get started
        </Link>
        <Link to="/login" className={buttonClass('outlineOnDark', 'px-6 py-3')}>
          Log in
        </Link>
      </div>
    );
  }
  if (user.role === 'mechanic') {
    return (
      <div className="mt-8">
        <Link to="/mechanic" className={buttonClass('primary', 'px-6 py-3')}>
          Go to dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link to="/report-fault" className={buttonClass('primary', 'px-6 py-3')}>
        Report a problem
      </Link>
      <Link to="/my-reports" className={buttonClass('outlineOnDark', 'px-6 py-3')}>
        My reports
      </Link>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('connected'))
      .catch(() => setStatus('unreachable'));
  }, []);

  return (
    <div>
      <section className="bg-ink px-4 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-caution">
            Customer ↔ Mechanic
          </p>
          <h1 className="mt-2 font-display text-6xl leading-none tracking-wide sm:text-7xl">
            REPORT IT.
            <br />
            QUOTE IT.
            <br />
            FIX IT.
          </h1>
          <p className="mt-5 max-w-lg text-white/70">
            {user
              ? `Welcome back, ${user.name}.`
              : 'One ticket, start to finish — file a fault report, get a real quote, book the appointment, and watch the status move.'}
          </p>
          <HeroCTA user={user} />
          <p className="mt-10 font-mono text-xs text-white/40">
            SYSTEM: {status === 'checking' ? 'CHECKING…' : status === 'connected' ? 'CONNECTED' : 'UNREACHABLE'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <span className="font-display text-5xl text-ink/10">{step.n}</span>
              <h2 className="font-display text-xl tracking-wide text-ink">{step.title}</h2>
              <p className="mt-1 text-sm text-steel">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
