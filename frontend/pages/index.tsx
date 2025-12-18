import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4">PIC App</h1>
        <p className="text-gray-600 mb-8">
          Training Registration & Document Management System
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
