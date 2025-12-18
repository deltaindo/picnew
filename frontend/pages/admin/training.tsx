import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface TrainingProgram {
  id: number;
  name: string;
  bidang: { name: string };
  durationDays: number;
  minParticipants: number;
  maxParticipants: number;
  status: string;
}

export default function TrainingPage() {
  const router = useRouter();
  const [training, setTraining] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bidangId: '',
    durationDays: '5',
    minParticipants: '8',
    maxParticipants: '25',
  });

  useEffect(() => {
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      const response = await api.get('/admin/training');
      setTraining(response.data.data);
    } catch (error) {
      if ((error as any).response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load training programs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/training', formData);
      toast.success('Training program created');
      setShowModal(false);
      setFormData({ name: '', description: '', bidangId: '', durationDays: '5', minParticipants: '8', maxParticipants: '25' });
      fetchTraining();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create training');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Training Programs</h1>
            <p className="text-gray-600">Manage all training programs</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Training
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Bidang</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Max Participants</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {training.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{t.name}</td>
                  <td className="px-6 py-4">{t.bidang.name}</td>
                  <td className="px-6 py-4">{t.durationDays} days</td>
                  <td className="px-6 py-4">{t.maxParticipants}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Add Training Program</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Training Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
              <select
                value={formData.bidangId}
                onChange={(e) => setFormData({ ...formData, bidangId: e.target.value })}
                className="w-full px-3 py-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select Bidang</option>
                <option value="1">PAA</option>
                <option value="2">AK3U</option>
                <option value="3">ELEVATOR</option>
                <option value="4">LISTRIK</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
