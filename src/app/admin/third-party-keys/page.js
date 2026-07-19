'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminThirdPartyKeys() {
  const [keys, setKeys] = useState([]);
  const [serviceName, setServiceName] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');

  const fetchKeys = async () => {
    const res = await fetch('/api/admin/third-party-keys');
    const data = await res.json();
    if (data.success) {
      setKeys(data.data);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const addKey = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/third-party-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_name: serviceName, api_key: apiKey }),
    });
    if (res.ok) {
      setServiceName('');
      setApiKey('');
      fetchKeys();
    }
  };

  const deleteKey = async (id) => {
    if (!confirm('Are you sure you want to delete this key?')) return;
    const res = await fetch(`/api/admin/third-party-keys?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchKeys();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Third-Party API Keys</h1>
      
      {/* Add New Key Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Key</h2>
        <form onSubmit={addKey} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" 
              required 
            >
              <option value="OpenAI">OpenAI</option>
              <option value="GeminiAi">GeminiAi</option>
            </select>
          </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" 
                required 
              />
            </div>
            <button type="submit" className="bg-[#1f934b] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Save Key
            </button>
          </form>
        </div>

        {/* Keys List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-gray-600 font-semibold">Service Name</th>
                <th className="p-4 text-gray-600 font-semibold">API Key (Hidden)</th>
                <th className="p-4 text-gray-600 font-semibold">Status</th>
                <th className="p-4 text-gray-600 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(key => (
                <tr key={key._id} className="border-b border-gray-50">
                  <td className="p-4 font-medium text-gray-800">{key.service_name}</td>
                  <td className="p-4 font-mono text-sm text-gray-500">••••••••••••••••</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => deleteKey(key._id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No third-party keys added yet.</td></tr>
              )}
            </tbody>
          </table>
      </div>
    </div>
  );
}
