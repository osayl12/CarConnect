import { useState } from 'react';

const emptyForm = { make: '', model: '', year: '', vin: '', licensePlate: '', color: '' };

function Field({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      />
    </label>
  );
}

// Note: when editing, the parent renders this with key={vehicle._id}, so a
// different vehicle mounts a fresh instance instead of needing an effect to
// re-sync state on prop changes.
export default function VehicleForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initialValues ? { ...emptyForm, ...initialValues } : emptyForm);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, year: form.year ? Number(form.year) : undefined };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2"
    >
      <Field label="Make" name="make" value={form.make} onChange={handleChange} required />
      <Field label="Model" name="model" value={form.model} onChange={handleChange} required />
      <Field label="Year" name="year" type="number" value={form.year} onChange={handleChange} />
      <Field label="Color" name="color" value={form.color} onChange={handleChange} />
      <Field label="VIN (optional)" name="vin" value={form.vin} onChange={handleChange} />
      <Field
        label="License plate (optional)"
        name="licensePlate"
        value={form.licensePlate}
        onChange={handleChange}
      />

      <div className="col-span-full flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save vehicle'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
