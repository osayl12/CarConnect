import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listVehicles } from '../services/vehicles';
import { createFaultReport } from '../services/faults';

export default function ReportFault() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [form, setForm] = useState({ vehicle: '', description: '', errorCode: '', urgency: 'medium' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listVehicles()
      .then((list) => {
        setVehicles(list);
        if (list.length > 0) setForm((f) => ({ ...f, vehicle: list[0]._id }));
      })
      .catch(() => setError('Could not load your vehicles'))
      .finally(() => setLoadingVehicles(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vehicle || !form.description.trim()) {
      setError('Vehicle and description are required');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (image) data.append('image', image);

    setSubmitting(true);
    try {
      const report = await createFaultReport(data);
      navigate(`/reports/${report._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loadingVehicles && vehicles.length === 0) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4 text-center">
        <p className="text-slate-600">
          Add a vehicle before reporting a problem.
        </p>
        <Link to="/vehicles" className="mt-2 inline-block font-medium text-slate-900 underline">
          Go to My Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-lg px-4 pb-10">
      <h1 className="text-2xl font-bold text-slate-900">Report a Problem</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Vehicle</label>
          <select
            name="vehicle"
            value={form.vehicle}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.year ? `${v.year} ` : ''}
                {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">What's wrong?</label>
          <textarea
            name="description"
            required
            rows={4}
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the issue..."
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Error code (optional)</label>
          <input
            type="text"
            name="errorCode"
            value={form.errorCode}
            onChange={handleChange}
            placeholder="e.g. P0420"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Urgency</label>
          <select
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Photo (optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
