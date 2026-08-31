import { useEffect, useState } from 'react';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/vehicles';
import VehicleForm from '../components/VehicleForm';
import RepairRecordCard from '../components/RepairRecordCard';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Vehicles</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {showAddForm ? 'Close' : '+ Add vehicle'}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && vehicles.length === 0 && (
          <p className="text-sm text-slate-500">No vehicles yet. Add one to get started.</p>
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
            <div key={vehicle._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {vehicle.year ? `${vehicle.year} ` : ''}
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-slate-500">
                    {[vehicle.color, vehicle.licensePlate, vehicle.vin].filter(Boolean).join(' · ') ||
                      'No further details'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingId(vehicle._id)}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <RepairRecordCard vehicleId={vehicle._id} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
