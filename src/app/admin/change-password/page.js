'use client';
import { useState } from 'react';

export default function AdminChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('Updating...');
    const res = await fetch('/api/admin/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    setPwdMsg(data.message || (data.success ? 'Success' : 'Failed'));
    if (data.success) {
      setOldPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Security Settings</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Admin Password</h2>
        <form onSubmit={changePassword} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <button type="submit" className="bg-[#1f934b] text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Update Password
          </button>
          {pwdMsg && <span className="text-sm font-medium ml-2 text-gray-600">{pwdMsg}</span>}
        </form>
      </div>
    </div>
  );
}
