'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [keys, setKeys] = useState([]);
  const [credit, setCredit] = useState(100);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchKeys = async () => {
    const res = await fetch('/api/admin/keys');
    const data = await res.json();
    if (data.success) {
      setKeys(data.data);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const generateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credit_limit: credit, duration_days: duration }),
    });
    if (res.ok) {
      fetchKeys();
    }
    setLoading(false);
  };

  const deleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this key?')) return;
    const res = await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchKeys();
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin-login';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">License Management</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Generate New License Key</h2>
          <form onSubmit={generateKey} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
              <input 
                type="number" 
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500"
              >
                <option value={30}>1 Month (30 Days)</option>
                <option value={90}>3 Months (90 Days)</option>
                <option value={180}>6 Months (180 Days)</option>
                <option value={365}>1 Year (365 Days)</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#1f934b] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate API Key'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">API Key</th>
                <th className="p-4 font-semibold text-gray-600">Credit Limit</th>
                <th className="p-4 font-semibold text-gray-600">Expiration Date</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">PC Build No.</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-gray-800">{key.api_key}</td>
                  <td className="p-4 text-gray-700">{key.credit_limit}</td>
                  <td className="p-4 text-gray-700">{new Date(key.expire_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      key.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {key.userId ? <span className="text-blue-600 font-medium">User: {key.userId.name}</span> : (key.pc_build_number || 'Unbound/Admin')}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteKey(key._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No keys generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}
