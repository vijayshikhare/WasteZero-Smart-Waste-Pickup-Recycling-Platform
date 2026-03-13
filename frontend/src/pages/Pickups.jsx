import { Recycle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Pickups() {
  const { api } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    location: '',
    wasteType: 'plastic',
    quantityKg: '',
    scheduledDate: '',
  });

  const fetchPickups = async () => {
    try {
      const res = await api.get('/api/user/pickups');
      setPickups(res.data?.pickups || []);
    } catch (err) {
      console.error('failed load pickups', err);
      toast.error('Unable to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location || !form.wasteType || !form.quantityKg || !form.scheduledDate) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await api.post('/api/user/pickups', form);
      toast.success('Pickup scheduled');
      setShowForm(false);
      setForm({ location: '', wasteType: 'plastic', quantityKg: '', scheduledDate: '' });
      fetchPickups();
    } catch (err) {
      console.error('[pickup create]', err);
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pickups</h1>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> {showForm ? 'Cancel' : 'Schedule Pickup'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Waste Type</label>
            <select
              name="wasteType"
              value={form.wasteType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="plastic">Plastic</option>
              <option value="paper">Paper</option>
              <option value="metal">Metal</option>
              <option value="organic">Organic</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
            <input
              type="number"
              name="quantityKg"
              value={form.quantityKg}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Scheduled Date</label>
            <input
              type="datetime-local"
              name="scheduledDate"
              value={form.scheduledDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Recycle className="h-16 w-16 mx-auto text-green-500 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">No pickups scheduled</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start managing waste collection schedules for your community.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Schedule First Pickup
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map(p => (
            <div key={p._id} className="bg-white rounded-xl p-5 shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{p.location}</p>
                <p className="text-sm text-gray-600">{p.wasteType} &bull; {p.quantityKg}kg</p>
                <p className="text-sm text-gray-500">{new Date(p.scheduledDate).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                {p.status || 'pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}