'use client';
import { useState, useEffect } from 'react';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPayments = async () => {
    const res = await fetch('/api/admin/payments');
    const data = await res.json();
    if (data.success) setPayments(data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAction = async (paymentId, action) => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;
    setProcessingId(paymentId);
    await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, action })
    });
    setProcessingId(null);
    fetchPayments();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Manual Payments</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Date</th>
              <th className="p-4 font-semibold text-gray-600">User / Contact</th>
              <th className="p-4 font-semibold text-gray-600">Package</th>
              <th className="p-4 font-semibold text-gray-600">Action Type</th>
              <th className="p-4 font-semibold text-gray-600">Payment Info</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm text-gray-700">{new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.mobile} | {p.email}</div>
                </td>
                <td className="p-4 text-sm font-medium text-blue-600">
                  {p.packageId?.name || 'Unknown'} <span className="text-gray-500">(৳{p.amount})</span>
                </td>
                <td className="p-4 text-sm">
                  {p.licenseId ? (
                    <span className="text-purple-600 font-semibold">Renewal<br/><span className="text-xs font-mono">{p.licenseId.api_key}</span></span>
                  ) : (
                    <span className="text-green-600 font-semibold">New License</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-sm font-bold text-gray-700">{p.payment_method}</div>
                  <div className="text-xs font-mono text-gray-500">{p.trx_id}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    p.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {p.status === 'Pending' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(p._id, 'Approve')} 
                        disabled={processingId === p._id}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleAction(p._id, 'Reject')} 
                        disabled={processingId === p._id}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payment requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
