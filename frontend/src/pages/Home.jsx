import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Home() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    api
      .get('/health')
      .then(() => setStatus('connected'))
      .catch(() => setStatus('unreachable'));
  }, []);

  const statusStyles = {
    checking: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    unreachable: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Car Connect</h1>
      <p className="mt-2 text-slate-600">
        Connecting customers with mechanics for fault reporting and repair coordination.
      </p>
      <span
        className={`mt-6 rounded-full px-4 py-1 text-sm font-medium ${statusStyles[status]}`}
      >
        Backend API: {status}
      </span>
    </div>
  );
}
