import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/admin/auth/me');
        setUser(response.data.user);
      } catch (error) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PIC Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-6">Email: {user?.email}</p>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Training Programs', href: '/admin/training', icon: '📚' },
              { title: 'Master Data', href: '/admin/master-data', icon: '⚙️' },
              { title: 'Registration Links', href: '/admin/links', icon: '🔗' },
              { title: 'Registrations', href: '/admin/registrations', icon: '📝' },
              { title: 'Documents', href: '/admin/documents', icon: '📄' },
              { title: 'Certificates', href: '/admin/certificates', icon: '🎓' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-gray-800">{item.title}</div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
