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

  // Checkout Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [checkoutType, setCheckoutType] = useState('new');
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [trxId, setTrxId] = useState('');
  const router = useRouter();

  const fetchUserData = async () => {
    const res = await fetch('/api/user/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setLicenses(data.licenses);
      setName(data.user.name || '');
      setEmail(data.user.email || '');
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

  const handleSubscribeClick = (pkg) => {
    setSelectedPkg(pkg);
    setShowModal(true);
  };

  const submitPurchase = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    const res = await fetch('/api/user/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        packageId: selectedPkg._id,
        licenseId: checkoutType === 'renew' ? selectedLicenseId : null,
        name,
        email,
        mobile,
        payment_method: paymentMethod,
        trx_id: trxId
      }),
    });
    if (res.ok) {
      alert(`Payment request submitted successfully! Your license will be updated once the admin approves it.`);
      setShowModal(false);
      setTrxId('');
    } else {
      const errorData = await res.json();
      alert(`Error: ${errorData.message}`);
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
                onClick={() => handleSubscribeClick(pkg)} 
                className={`w-full py-2 text-white rounded-lg transition-colors font-medium ${pkg.is_popular ? 'bg-[#1f934b] hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                Purchase
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

      {/* Checkout Modal */}
      {showModal && selectedPkg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Checkout: {selectedPkg.name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100 text-green-800">
                <p className="font-semibold text-lg mb-1">Please pay ৳{selectedPkg.price_tk}</p>
                <p className="text-sm">Send Money to: <strong className="font-bold">01967550181</strong> (bKash / Rocket / Nagad Personal)</p>
              </div>
              
              <form onSubmit={submitPurchase} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Type</label>
                  <select value={checkoutType} onChange={e => setCheckoutType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="new">Generate New License Key</option>
                    <option value="renew">Renew Existing License Key</option>
                  </select>
                </div>
                
                {checkoutType === 'renew' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select License to Renew</label>
                    <select value={selectedLicenseId} onChange={e => setSelectedLicenseId(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="" disabled>Select a license...</option>
                      {licenses.map(lic => <option key={lic._id} value={lic._id}>{lic.api_key} ({lic.status})</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                    <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (TrxID)</label>
                    <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                
                <button type="submit" disabled={subscribing} className="w-full bg-[#1f934b] text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors mt-4">
                  {subscribing ? 'Submitting...' : 'Submit Payment Info'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
