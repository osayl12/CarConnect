import { useState } from 'react';
import { Field, Input } from './ui/Field';
import Button from './ui/Button';

const emptyForm = { make: '', model: '', year: '', vin: '', licensePlate: '', color: '' };

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
      className="grid grid-cols-1 gap-3 rounded-sm border border-ink/10 bg-white p-4 shadow-sm sm:grid-cols-2"
    >
      <Field label="Make">
        <Input name="make" value={form.make} onChange={handleChange} required />
      </Field>
      <Field label="Model">
        <Input name="model" value={form.model} onChange={handleChange} required />
      </Field>
      <Field label="Year">
        <Input name="year" type="number" value={form.year} onChange={handleChange} />
      </Field>
      <Field label="Color">
        <Input name="color" value={form.color} onChange={handleChange} />
      </Field>
      <Field label="VIN (optional)">
        <Input name="vin" value={form.vin} onChange={handleChange} />
      </Field>
      <Field label="License plate (optional)">
        <Input name="licensePlate" value={form.licensePlate} onChange={handleChange} />
      </Field>

      <div className="col-span-full flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save vehicle'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
