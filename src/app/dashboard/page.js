'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const router = useRouter();

  const fetchUserData = async () => {
    const res = await fetch('/api/user/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setLicenses(data.licenses);
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAvailablePackages(data.data);
      });
  }, []);

  const handleSubscribe = async (packageId) => {
    if (!confirm('Are you sure you want to purchase this subscription?')) return;
    setSubscribing(true);
    const res = await fetch('/api/user/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    });
    if (res.ok) {
      alert(`Successfully purchased subscription!`);
      fetchUserData();
    }
    setSubscribing(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg('Updating...');
    const res = await fetch('/api/user/password', {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-gray-800">StockMetaPro</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Licenses</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-gray-600 font-semibold">API Key</th>
                <th className="p-4 text-gray-600 font-semibold">Credits Used</th>
                <th className="p-4 text-gray-600 font-semibold">Created</th>
                <th className="p-4 text-gray-600 font-semibold">Activated</th>
                <th className="p-4 text-gray-600 font-semibold">Expires</th>
                <th className="p-4 text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(lic => (
                <tr key={lic._id} className="border-b border-gray-50">
                  <td className="p-4 font-mono text-sm">{lic.api_key}</td>
                  <td className="p-4 font-semibold text-gray-700">{lic.credits_used} / {lic.credit_limit}</td>
                  <td className="p-4 text-gray-600">{new Date(lic.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{lic.activation_date ? new Date(lic.activation_date).toLocaleDateString() : <span className="text-blue-600">Pending Activation</span>}</td>
                  <td className="p-4 font-medium">{lic.expire_date ? new Date(lic.expire_date).toLocaleDateString() : <span className="text-gray-400">N/A</span>}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${lic.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {lic.status}
                    </span>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">You don't have any active licenses.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Change Password */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h2>
          <form onSubmit={changePassword} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
            </div>
            <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
              Update Password
            </button>
            {pwdMsg && <span className="text-sm font-medium ml-2 text-gray-600">{pwdMsg}</span>}
          </form>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchase New Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePackages.map(pkg => (
            <div key={pkg._id} className={`bg-white p-6 rounded-xl shadow-sm border-2 text-center relative ${pkg.is_popular ? 'border-[#1f934b]' : 'border-gray-100'}`}>
              {pkg.is_popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1f934b] text-white text-xs px-3 py-1 rounded-full font-medium">POPULAR</span>}
              <h3 className="text-xl font-bold mb-2 text-gray-800">{pkg.name}</h3>
              <p className="text-3xl font-bold text-[#1f934b] mb-2">৳{pkg.price_tk}</p>
              <p className="text-sm text-gray-600 mb-6 font-medium">{pkg.credit_limit} Credits / {pkg.duration_days} Days</p>
              <button 
                onClick={() => handleSubscribe(pkg._id)} 
                disabled={subscribing} 
                className={`w-full py-2 text-white rounded-lg transition-colors font-medium ${pkg.is_popular ? 'bg-[#1f934b] hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                {subscribing ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
          {availablePackages.length === 0 && (
            <div className="col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
              No subscription packages available at the moment.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
