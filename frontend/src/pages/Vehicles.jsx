import { useEffect, useState } from 'react';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicles';
import VehicleForm from '../components/VehicleForm';
import RepairRecordCard from '../components/RepairRecordCard';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listVehicles()
      .then(setVehicles)
      .catch(() => setError('Could not load vehicles'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const vehicle = await createVehicle(payload);
      setVehicles((prev) => [vehicle, ...prev]);
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, payload) => {
    setSubmitting(true);
    setError('');
    try {
      const updated = await updateVehicle(id, payload);
      setVehicles((prev) => prev.map((v) => (v._id === id ? updated : v)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch {
      setError('Could not delete vehicle');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        eyebrow="Garage"
        title="My Vehicles"
        action={
          <Button onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? 'Close' : '+ Add vehicle'}
          </Button>
        }
      />

      {error && <p className="mt-4 text-sm text-alert">{error}</p>}

      {showAddForm && (
        <div className="mt-4">
          <VehicleForm
            onSubmit={handleCreate}
            onCancel={() => setShowAddForm(false)}
            submitting={submitting}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-steel">Loading…</p>}
        {!loading && vehicles.length === 0 && (
          <EmptyState
            title="No vehicles yet"
            message="Add one to start filing reports against it."
            action={<Button onClick={() => setShowAddForm(true)}>+ Add vehicle</Button>}
          />
        )}

        {vehicles.map((vehicle) =>
          editingId === vehicle._id ? (
            <VehicleForm
              key={vehicle._id}
              initialValues={vehicle}
              onSubmit={(payload) => handleUpdate(vehicle._id, payload)}
              onCancel={() => setEditingId(null)}
              submitting={submitting}
            />
          ) : (
            <Card key={vehicle._id} ticket>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-steel">#{vehicle._id.slice(-6).toUpperCase()}</p>
                  <p className="mt-0.5 font-display text-xl tracking-wide text-ink">
                    {vehicle.year ? `${vehicle.year} ` : ''}
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-steel">
                    {[vehicle.color, vehicle.licensePlate, vehicle.vin].filter(Boolean).join(' · ') ||
                      'No further details'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingId(vehicle._id)}
                    className="text-sm font-medium text-steel hover:text-ink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="text-sm font-medium text-alert hover:text-alert/70"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <RepairRecordCard vehicleId={vehicle._id} />
            </Card>
          )
        )}
      </div>
    </div>
  );
}
