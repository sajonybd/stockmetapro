'use client';
import { useState, useEffect } from 'react';

export default function AdminPaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.success) {
        // Filter only Approved payments for Payment History
        const approved = (data.data || []).filter(p => p.status === 'Approved');
        setPayments(approved);
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((pay) => {
    const q = searchQuery.toLowerCase().trim();
    const methodMatch = filterMethod === 'ALL' || pay.payment_method?.toUpperCase() === filterMethod;
    
    if (!q) return methodMatch;

    const nameMatch = pay.name?.toLowerCase().includes(q);
    const emailMatch = pay.email?.toLowerCase().includes(q);
    const mobileMatch = pay.mobile?.toLowerCase().includes(q);
    const trxMatch = pay.trx_id?.toLowerCase().includes(q);
    const pkgMatch = pay.packageId?.name?.toLowerCase().includes(q);

    return methodMatch && (nameMatch || emailMatch || mobileMatch || trxMatch || pkgMatch);
  });

  const totalRevenueBDT = payments
    .filter(p => p.currency !== 'USD')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRevenueUSD = payments
    .filter(p => p.currency === 'USD')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-semibold flex items-center justify-center min-h-[400px]">
        <span className="animate-spin text-2xl mr-2">🌀</span> Loading Payment History Records...
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">Complete log of all approved and verified contributor payments.</p>
        </div>

        {/* Total Summary Cards */}
        <div className="flex gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total BDT Revenue</div>
            <div className="text-lg font-extrabold text-emerald-700">৳{totalRevenueBDT.toLocaleString()}</div>
          </div>
          {totalRevenueUSD > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-right">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Total USD Revenue</div>
              <div className="text-lg font-extrabold text-blue-700">${totalRevenueUSD.toFixed(2)}</div>
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-right">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved Count</div>
            <div className="text-lg font-extrabold text-gray-800">{payments.length} Records</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by Name, Email, Phone, or TrxID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Method:</label>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Methods</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="ROCKET">Rocket</option>
            <option value="PAYONEER">Payoneer</option>
            <option value="SKRILL">Skrill</option>
          </select>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Approved Date</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Contributor Name</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Phone & Email</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Package Plan</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Payment Method</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Transaction ID / Ref</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Amount Paid</th>
                <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay) => (
                <tr key={pay._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(pay.updatedAt || pay.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-800">
                    {pay.name}
                  </td>
                  <td className="p-4 text-xs font-mono text-gray-700">
                    <div className="font-semibold">{pay.mobile}</div>
                    <div className="text-gray-400">{pay.email}</div>
                  </td>
                  <td className="p-4 text-sm font-semibold text-gray-800">
                    {pay.packageId?.name || 'Pro Package'}
                  </td>
                  <td className="p-4 text-xs font-bold text-blue-700 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      {pay.payment_method}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono font-semibold text-gray-800 break-all">
                    {pay.trx_id}
                  </td>
                  <td className="p-4 text-sm font-extrabold text-emerald-700 whitespace-nowrap">
                    {pay.currency === 'USD' ? `$${pay.amount?.toFixed(2)}` : `৳${pay.amount}`}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      ✓ Approved
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    No approved payment history records match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
