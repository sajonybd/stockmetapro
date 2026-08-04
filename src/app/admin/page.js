'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const [keys, setKeys] = useState([]);
  const [credit, setCredit] = useState(100);
  const [duration, setDuration] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [editingKey, setEditingKey] = useState(null);
  const [editCredit, setEditCredit] = useState('');
  const [editExpire, setEditExpire] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editPcBuild, setEditPcBuild] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  
  // Tab control states: 'keys', 'payments', or 'blocked'
  const [activeTab, setActiveTab] = useState('keys');
  const [payments, setPayments] = useState([]);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const router = useRouter();

  const fetchKeys = async () => {
    const res = await fetch('/api/admin/keys');
    const data = await res.json();
    if (data.success) {
      setKeys(data.data);
    }
  };

  const fetchPayments = async () => {
    const res = await fetch('/api/admin/payments');
    const data = await res.json();
    if (data.success) {
      setPayments(data.data);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/admin/blocked');
      const data = await res.json();
      if (data.success) {
        setBlockedUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unblockUser = async (id) => {
    if (!confirm('Are you sure you want to unblock this user?')) return;
    try {
      const res = await fetch(`/api/admin/blocked?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchBlockedUsers();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
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
    fetchPayments();
    fetchBlockedUsers();
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
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credit_limit: credit, 
          duration_days: duration,
          name: newName,
          email: newEmail,
          mobile: newMobile
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewName('');
        setNewEmail('');
        setNewMobile('');
        fetchKeys();
      } else {
        alert('Failed to generate: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
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
    setEditName(key.userId?.name || '');
    setEditEmail(key.userId?.email || '');
    setEditMobile(key.userId?.mobile || '');
    setEditPcBuild(key.pc_build_number || '');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingKey._id, 
          action: 'edit', 
          credit_limit: editCredit, 
          expire_date: editExpire,
          name: editName,
          email: editEmail,
          mobile: editMobile,
          pc_build_number: editPcBuild
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to save changes: ' + (data.message || 'Unknown database error'));
        return;
      }
      setEditingKey(null);
      fetchKeys();
    } catch (err) {
      alert('Error updating user info: ' + err.message);
    }
  };

  const handlePaymentAction = async (paymentId, action) => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;
    setProcessingPaymentId(paymentId);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment successfully ${action}d!`);
        fetchPayments();
        fetchKeys(); // Refresh keys since approval generates keys
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setProcessingPaymentId(null);
  };
  const copyToClipboard = (text, fieldId) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedback(fieldId);
    setTimeout(() => setCopyFeedback(''), 1500);
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
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Generate New License Key (with User Account)</h2>
          <form onSubmit={generateKey} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
              <input 
                type="text" 
                placeholder="Client Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
              <input 
                type="text" 
                placeholder="017xxxxxxxx"
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                placeholder="client@mail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
              <input 
                type="number" 
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm"
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
              className="bg-[#1f934b] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {loading ? 'Generating...' : 'Generate API Key'}
            </button>
          </form>
        </div>


        {/* Search Input Box */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search by API Key, Name, Email, Mobile or PC Hardware ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-[1200px] w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">API Key (License)</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Credits</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">User Name</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Mobile</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Activated</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Expires</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">PC Hardware ID</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys
                  .filter((key) => {
                    const q = searchQuery.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (key.api_key && key.api_key.toLowerCase().includes(q)) ||
                      (key.pc_build_number && key.pc_build_number.toLowerCase().includes(q)) ||
                      (key.userId?.name && key.userId.name.toLowerCase().includes(q)) ||
                      (key.userId?.email && key.userId.email.toLowerCase().includes(q)) ||
                      (key.userId?.mobile && key.userId.mobile.toLowerCase().includes(q))
                    );
                  })
                  .map((key) => (
                    <tr key={key._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm font-bold text-gray-800 break-all relative group">
                        <span 
                          onClick={() => copyToClipboard(key.api_key, `key-${key._id}`)}
                          className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                          title="Click to copy License Key"
                        >
                          {key.api_key}
                          <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
                        </span>
                        {copyFeedback === `key-${key._id}` && (
                          <span className="absolute top-1 left-4 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow animate-bounce z-10">Copied!</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-700 whitespace-nowrap">{key.credits_used || 0} / {key.credit_limit}</td>
                      <td className="p-4 text-sm text-gray-800 font-semibold">{key.userId?.name || <span className="text-gray-400">Unbound/Admin</span>}</td>
                      <td className="p-4 text-sm font-mono text-gray-700 relative group">
                        {key.userId?.mobile ? (
                          <>
                            <span 
                              onClick={() => copyToClipboard(key.userId.mobile, `mob-${key._id}`)}
                              className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                              title="Click to copy Phone"
                            >
                              {key.userId.mobile}
                              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
                            </span>
                            {copyFeedback === `mob-${key._id}` && (
                              <span className="absolute top-1 left-4 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow animate-bounce z-10">Copied!</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600 break-all relative group">
                        {key.userId?.email ? (
                          <>
                            <span 
                              onClick={() => copyToClipboard(key.userId.email, `mail-${key._id}`)}
                              className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                              title="Click to copy Email"
                            >
                              {key.userId.email}
                              <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
                            </span>
                            {copyFeedback === `mail-${key._id}` && (
                              <span className="absolute top-1 left-4 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow animate-bounce z-10">Copied!</span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-medium whitespace-nowrap">{key.activation_date ? new Date(key.activation_date).toLocaleDateString() : <span className="text-blue-600 font-medium">Pending</span>}</td>
                      <td className="p-4 text-sm font-medium whitespace-nowrap">{key.expire_date ? new Date(key.expire_date).toLocaleDateString() : <span className="text-gray-400 font-medium">N/A</span>}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          key.status === 'Active' ? 'bg-green-100 text-green-700' : 
                          key.status === 'Disabled' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-gray-500 break-all">{key.pc_build_number || <span className="text-gray-400">Not Activated</span>}</td>
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
                    <td colSpan="10" className="p-8 text-center text-gray-500">No keys generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit License & User Details</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" placeholder="Unbound/No User" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Mobile</label>
                  <input type="text" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PC Hardware ID (Lock Status)</label>
                {editPcBuild ? (
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                    <span className="font-mono text-xs text-gray-700 break-all select-all">{editPcBuild}</span>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to remove this PC Hardware lock? Users will be able to bind a new PC.')) {
                          setEditPcBuild('');
                        }
                      }}
                      className="ml-2 px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors whitespace-nowrap"
                    >
                      ❌ Remove Lock
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-400 font-medium italic">
                    Not locked to any PC yet. The license will auto-bind to the next device that runs the app.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                  <input type="number" value={editCredit} onChange={(e) => setEditCredit(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                  <input type="date" value={editExpire} onChange={(e) => setEditExpire(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Changing email/mobile updates details linked to this license.</p>
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
