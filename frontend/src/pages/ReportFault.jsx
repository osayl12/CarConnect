import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listVehicles } from '../services/vehicles';
import { createFaultReport } from '../services/faults';
import { Field, Input, Textarea, Select } from '../components/ui/Field';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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
        <p className="text-steel">Add a vehicle before reporting a problem.</p>
        <Link to="/vehicles" className="mt-2 inline-block font-semibold text-signal underline">
          Go to My Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-lg px-4 pb-10">
      <p className="font-mono text-xs font-semibold uppercase tracking-widest text-steel">New ticket</p>
      <h1 className="font-display text-4xl tracking-wide text-ink">Report a Problem</h1>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Vehicle">
            <Select name="vehicle" value={form.vehicle} onChange={handleChange}>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.year ? `${v.year} ` : ''}
                  {v.make} {v.model}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="What's wrong?">
            <Textarea
              name="description"
              required
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue…"
            />
          </Field>

          <Field label="Error code (optional)" hint="Straight from the dashboard, if you have one">
            <Input
              type="text"
              name="errorCode"
              value={form.errorCode}
              onChange={handleChange}
              placeholder="e.g. P0420"
              className="font-mono"
            />
          </Field>

          <Field label="Urgency">
            <Select name="urgency" value={form.urgency} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>

          <Field label="Photo (optional)">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-steel file:mr-3 file:rounded-sm file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </Field>

          {error && <p className="text-sm text-alert">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
