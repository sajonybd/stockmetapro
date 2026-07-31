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

  // Edit state
  const [editingPkg, setEditingPkg] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCreditLimit, setEditCreditLimit] = useState('');
  const [editPriceTk, setEditPriceTk] = useState('');
  const [editDurationDays, setEditDurationDays] = useState('');
  const [editIsPopular, setEditIsPopular] = useState(false);

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
    setIsPopular(false);
    fetchPackages();
  };

  const openEditModal = (pkg) => {
    setEditingPkg(pkg);
    setEditName(pkg.name);
    setEditCreditLimit(pkg.credit_limit);
    setEditPriceTk(pkg.price_tk);
    setEditDurationDays(pkg.duration_days);
    setEditIsPopular(pkg.is_popular);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/packages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: editingPkg._id, 
        name: editName,
        credit_limit: parseInt(editCreditLimit, 10),
        price_tk: parseInt(editPriceTk, 10),
        duration_days: parseInt(editDurationDays, 10),
        is_popular: editIsPopular
      }),
    });
    setEditingPkg(null);
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
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(pkg)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                    <button onClick={() => deletePackage(pkg._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No packages created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Package</h2>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
                <input type="number" value={editCreditLimit} onChange={(e) => setEditCreditLimit(e.target.value)} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Tk)</label>
                <input type="number" value={editPriceTk} onChange={(e) => setEditPriceTk(e.target.value)} required min={0} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                <input type="number" value={editDurationDays} onChange={(e) => setEditDurationDays(e.target.value)} required min={1} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer mt-2">
                <input type="checkbox" checked={editIsPopular} onChange={(e) => setEditIsPopular(e.target.checked)} className="rounded border-gray-300 text-[#1f934b] focus:ring-[#1f934b]" />
                Popular Badge
              </label>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setEditingPkg(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1f934b] text-white rounded-lg font-medium hover:bg-green-700 transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
