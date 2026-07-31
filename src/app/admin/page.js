'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [keys, setKeys] = useState([]);
  const [credit, setCredit] = useState(100);
  const [duration, setDuration] = useState(30);
  
  // Edit State
  const [editingKey, setEditingKey] = useState(null);
  const [editCredit, setEditCredit] = useState('');
  const [editExpire, setEditExpire] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const router = useRouter();

  const fetchKeys = async () => {
    const res = await fetch('/api/admin/keys');
    const data = await res.json();
    if (data.success) {
      setKeys(data.data);
    }
  };

  const fetchMaintenanceStatus = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    if (data.success) {
      setMaintenanceMode(data.maintenance);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchMaintenanceStatus();
  }, []);

  const toggleMaintenanceMode = async () => {
    setTogglingMaintenance(true);
    const newStatus = !maintenanceMode;
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maintenance: newStatus }),
    });
    if (res.ok) {
      setMaintenanceMode(newStatus);
    }
    setTogglingMaintenance(false);
  };

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
    await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
    fetchKeys();
  };

  const toggleKeyStatus = async (key) => {
    const newStatus = key.status === 'Active' ? 'Disabled' : 'Active';
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key._id, action: 'toggle_status', status: newStatus }),
    });
    fetchKeys();
  };

  const openEditModal = (key) => {
    setEditingKey(key);
    setEditCredit(key.credit_limit);
    setEditExpire(key.expire_date ? new Date(key.expire_date).toISOString().split('T')[0] : '');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: editingKey._id, 
        action: 'edit', 
        credit_limit: editCredit, 
        expire_date: editExpire 
      }),
    });
    setEditingKey(null);
    fetchKeys();
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Server Maintenance Mode</h2>
            <p className="text-sm text-gray-500">Enable this to show the maintenance dialog on all user apps.</p>
          </div>
          <button 
            onClick={toggleMaintenanceMode}
            disabled={togglingMaintenance}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${maintenanceMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#1f934b] hover:bg-green-700 text-white'}`}
          >
            {togglingMaintenance ? 'Wait...' : (maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance')}
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
                <th className="p-4 font-semibold text-gray-600">Credits</th>
                <th className="p-4 font-semibold text-gray-600">Created</th>
                <th className="p-4 font-semibold text-gray-600">Activated</th>
                <th className="p-4 font-semibold text-gray-600">Expires</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600">Owner / PC</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-gray-800">{key.api_key}</td>
                  <td className="p-4 text-gray-700">{key.credits_used || 0} / {key.credit_limit}</td>
                  <td className="p-4 text-gray-700">{new Date(key.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{key.activation_date ? new Date(key.activation_date).toLocaleDateString() : <span className="text-blue-600">Pending</span>}</td>
                  <td className="p-4 font-medium">{key.expire_date ? new Date(key.expire_date).toLocaleDateString() : <span className="text-gray-400">N/A</span>}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      key.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      key.status === 'Disabled' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {key.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {key.userId ? <span className="text-blue-600 font-medium">User: {key.userId.name}</span> : (key.pc_build_number || 'Unbound/Admin')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => toggleKeyStatus(key)}
                        className={`${key.status === 'Active' ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'} text-sm font-medium`}
                      >
                        {key.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        onClick={() => openEditModal(key)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteKey(key._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">No keys generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit License</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <input type="number" value={editCredit} onChange={(e) => setEditCredit(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                <input type="date" value={editExpire} onChange={(e) => setEditExpire(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <p className="text-xs text-gray-500 mt-1">Leave blank if pending activation.</p>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setEditingKey(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1f934b] text-white rounded-lg font-medium hover:bg-green-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
