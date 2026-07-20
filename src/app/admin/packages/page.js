'use client';
import { useState, useEffect } from 'react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [name, setName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [priceTk, setPriceTk] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [isPopular, setIsPopular] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    const res = await fetch('/api/admin/packages');
    const data = await res.json();
    if (data.success) setPackages(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const addPackage = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        credit_limit: parseInt(creditLimit, 10), 
        price_tk: parseInt(priceTk, 10),
        duration_days: parseInt(durationDays, 10),
        is_popular: isPopular
      }),
    });
    setName('');
    setCreditLimit('');
    setPriceTk('');
    setDurationDays('30');
    setIsPopular(false);
    fetchPackages();
  };

  const deletePackage = async (id) => {
    if (!confirm('Delete this package?')) return;
    await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' });
    fetchPackages();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Subscription Packages</h1>
      
      {/* Add New Package Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Add New Package</h2>
        <form onSubmit={addPackage} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Package Name (e.g. Pro)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
            <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Tk)</label>
            <input type="number" value={priceTk} onChange={(e) => setPriceTk(e.target.value)} required min={0} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
            <input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#1f934b] focus:border-[#1f934b]" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mb-2">
              <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="rounded border-gray-300 text-[#1f934b] focus:ring-[#1f934b]" />
              Popular Badge
            </label>
            <button type="submit" className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors">
              Add Package
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Credit Limit</th>
              <th className="p-4 font-semibold text-gray-600">Price</th>
              <th className="p-4 font-semibold text-gray-600">Duration</th>
              <th className="p-4 font-semibold text-gray-600">Tags</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-gray-800">{pkg.name}</td>
                <td className="p-4 text-gray-700">{pkg.credit_limit}</td>
                <td className="p-4 text-green-600 font-medium">৳{pkg.price_tk}</td>
                <td className="p-4 text-gray-700">{pkg.duration_days} Days</td>
                <td className="p-4">
                  {pkg.is_popular && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Popular</span>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deletePackage(pkg._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No packages created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
