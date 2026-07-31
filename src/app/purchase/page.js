'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PublicPurchase() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form Flow States
  const [userType, setUserType] = useState('new'); // 'new' | 'existing'
  const [step, setStep] = useState(1); // 1: Select Type & Mobile, 2: Select Package & Pay
  
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [existingUser, setExistingUser] = useState(null);
  const [existingLicenses, setExistingLicenses] = useState([]);
  const [selectedLicense, setSelectedLicense] = useState('');
  
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPackages(data.data);
          if (data.data.length > 0) setSelectedPackage(data.data[0]._id);
        }
        setLoading(false);
      });
  }, []);

  const handleNext = async (e) => {
    e.preventDefault();
    if (userType === 'existing') {
      const res = await fetch(`/api/purchase?mobile=${mobile}`);
      const data = await res.json();
      if (data.success) {
        setExistingUser(data.user);
        setExistingLicenses(data.licenses);
        if (data.licenses.length > 0) setSelectedLicense(data.licenses[0]._id);
        setStep(2);
      } else {
        alert(data.message);
        if (data.message === 'No account exist with this number') {
          setUserType('new');
        }
      }
    } else {
      setStep(2);
    }
  };

  const submitPurchase = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        packageId: selectedPackage,
        licenseId: userType === 'existing' ? selectedLicense : null,
        name: userType === 'new' ? name : existingUser.name,
        email: userType === 'new' ? email : 'existing@user.com',
        mobile,
        payment_method: paymentMethod,
        trx_id: trxId,
        type: userType === 'existing' ? 'renew' : 'new'
      }),
    });
    
    if (res.ok) {
      alert(`Payment submitted successfully! You will receive an email once approved.`);
      window.location.href = '/login';
    } else {
      const errorData = await res.json();
      alert(`Error: ${errorData.message}`);
      setSubmitting(false);
    }
  };

  const pkg = packages.find(p => p._id === selectedPackage);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-6 bg-gray-800 text-white text-center">
          <h1 className="text-2xl font-bold">StockMetaPro Licensing</h1>
          <p className="text-sm opacity-80 mt-1">Purchase or Renew Subscription</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-6">
              <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
                <button type="button" onClick={() => setUserType('new')} className={`flex-1 py-2 text-sm font-medium rounded-md ${userType === 'new' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>New User</button>
                <button type="button" onClick={() => setUserType('existing')} className={`flex-1 py-2 text-sm font-medium rounded-md ${userType === 'existing' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Existing User (Buy Credit/Renew)</button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="e.g. 01xxxxxxxxx" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>

              {userType === 'new' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  </div>
                </>
              )}

              <button type="submit" className="w-full bg-[#1f934b] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                Next Step
              </button>
            </form>
          ) : (
            <form onSubmit={submitPurchase} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 font-medium text-sm">← Back</button>
                <h2 className="text-xl font-bold text-gray-800">
                  {userType === 'new' ? `Welcome, ${name}` : `Welcome back, ${existingUser.name}`}
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
                <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-800">
                  {packages.map(p => (
                    <option key={p._id} value={p._id}>{p.name} - ৳{p.price_tk} ({p.credit_limit} credits / {p.duration_days} days)</option>
                  ))}
                </select>
              </div>

              {userType === 'existing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select License to Renew</label>
                  <select value={selectedLicense} onChange={e => setSelectedLicense(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm">
                    {existingLicenses.map(l => (
                      <option key={l._id} value={l._id}>{l.api_key} ({l.status})</option>
                    ))}
                  </select>
                </div>
              )}

              {pkg && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-green-800 text-center">
                  <p className="font-semibold text-lg mb-1">Please pay ৳{pkg.price_tk}</p>
                  <p className="text-sm">Send Money to: <strong className="font-bold">01967550181</strong> (bKash / Rocket / Nagad Personal)</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (TrxID)</label>
                  <input type="text" value={trxId} onChange={e => setTrxId(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm uppercase" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-[#1f934b] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors">
                {submitting ? 'Processing...' : 'Submit Payment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
