'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
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
  }, []);

  const handleSubscribe = async (plan) => {
    setSubscribing(true);
    const res = await fetch('/api/user/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      alert(`Successfully subscribed to ${plan} plan!`);
      fetchUserData();
    }
    setSubscribing(false);
  };

  const handleLogout = () => {
    document.cookie = "user_session=; path=/; max-age=0";
    router.push('/login');
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
                <th className="p-4 text-gray-600 font-semibold">Credit Limit</th>
                <th className="p-4 text-gray-600 font-semibold">Expiration Date</th>
                <th className="p-4 text-gray-600 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(lic => (
                <tr key={lic._id} className="border-b border-gray-50">
                  <td className="p-4 font-mono text-sm">{lic.api_key}</td>
                  <td className="p-4 font-semibold text-gray-700">{lic.credits_used}</td>
                  <td className="p-4">{lic.credit_limit}</td>
                  <td className="p-4">{new Date(lic.expire_date).toLocaleDateString()}</td>
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

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Purchase New Subscription</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-bold mb-2">Basic Plan</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">$5<span className="text-sm text-gray-500">/mo</span></p>
            <button onClick={() => handleSubscribe('basic')} disabled={subscribing} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Purchase Basic</button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-600 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">POPULAR</span>
            <h3 className="text-lg font-bold mb-2">Premium Plan</h3>
            <p className="text-3xl font-bold text-blue-600 mb-4">$15<span className="text-sm text-gray-500">/mo</span></p>
            <button onClick={() => handleSubscribe('premium')} disabled={subscribing} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Purchase Premium</button>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-lg font-bold mb-2">Pro Plan</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">$30<span className="text-sm text-gray-500">/mo</span></p>
            <button onClick={() => handleSubscribe('pro')} disabled={subscribing} className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Purchase Pro</button>
          </div>
        </div>
      </main>
    </div>
  );
}
