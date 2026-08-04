'use client';
import { useState, useEffect } from 'react';

export default function AdminBlockedPage() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blocked');
      const data = await res.json();
      if (data.success) {
        setBlockedUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const unblockUser = async (id) => {
    if (!confirm('Are you sure you want to unblock this user? Once unblocked, they will be able to create new accounts.')) return;
    try {
      const res = await fetch(`/api/admin/blocked?id=${id}`, {
        method: 'DELETE',
      });
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

  const filtered = blockedUsers.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.toLowerCase().includes(q)) ||
      (u.reason && u.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Blocked Users</h1>
        <button 
          onClick={fetchBlockedUsers}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
        >
          🔄 Refresh Blocked List
        </button>
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-100 mb-8">
        <h2 className="text-lg font-semibold text-red-800 mb-2">About Blocked Users</h2>
        <p className="text-sm text-red-700 leading-relaxed">
          Users in this list are blocked from creating new accounts or renewing licenses. If a blocked user attempts to submit their mobile number or email, they will see an <strong>Account Rejected</strong> dialog instructing them to try with a new number/email.
          Removing a user from this list unblocks them completely.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <input 
            type="text"
            placeholder="Search by Name, Email, or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-red-500 focus:border-red-500 text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading blocked list...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Blocked Date</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Name</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Mobile</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Reason</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(u.blockedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      {u.name || 'N/A'}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-700 whitespace-nowrap">
                      {u.email || 'N/A'}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-red-600 whitespace-nowrap">
                      {u.mobile || 'N/A'}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {u.reason}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => unblockUser(u._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
                      >
                        Unblock & Allow Account
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No blocked users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
