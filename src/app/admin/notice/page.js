'use client';
import { useState, useEffect } from 'react';

export default function AdminNotice() {
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchNotice = async () => {
    const res = await fetch('/api/admin/notice');
    const data = await res.json();
    if (data.success && data.data) {
      setMessage(data.data.message);
      setIsActive(data.data.is_active);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotice();
  }, []);

  const saveNotice = async (e) => {
    e.preventDefault();
    setStatusMsg('Saving...');
    const res = await fetch('/api/admin/notice', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, is_active: isActive }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStatusMsg('Notice updated successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      setStatusMsg('Failed to update notice.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Software Notice Management</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-2 text-gray-700">Global Notice</h2>
        <p className="text-gray-500 mb-6 text-sm">Update the notice message that is sent to the software. You can toggle it off when not needed.</p>
        
        <form onSubmit={saveNotice}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notice Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-[#1f934b] focus:border-[#1f934b]" 
              placeholder="E.g. The server will be down for maintenance this Sunday."
            />
          </div>
          
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-[#1f934b] rounded border-gray-300 focus:ring-[#1f934b]"
              />
              Enable Notice (Send to Software)
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" className="bg-[#1f934b] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Save Changes
            </button>
            {statusMsg && <span className={`text-sm font-medium ${statusMsg.includes('success') ? 'text-green-600' : 'text-gray-600'}`}>{statusMsg}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
