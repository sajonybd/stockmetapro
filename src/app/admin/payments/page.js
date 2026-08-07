'use client';
import { useState, useEffect } from 'react';

export default function AdminPayments() {
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.success) setPayments(data.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (data.success) setTransactions(data.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const res = await fetch('/api/admin/blocked');
      const data = await res.json();
      if (data.success) setBlockedUsers(data.data);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPayments(), fetchTransactions(), fetchBlockedUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handlePaymentAction = async (paymentId, action) => {
    if (!confirm(`Are you sure you want to ${action} this payment request?`)) return;
    setProcessingPaymentId(paymentId);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment successfully ${action}d!`);
        await loadAllData();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this SMS transaction record?')) return;
    try {
      const res = await fetch(`/api/admin/transactions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Transaction record deleted successfully!');
        fetchTransactions();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const toggleTransactionStatus = async (id, currentStatus) => {
    const newStatus = (currentStatus === 'Matched') ? 'Unused' : 'Matched';
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchTransactions();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const unblockUser = async (id) => {
    if (!confirm('Are you sure you want to unblock this user and allow account access again?')) return;
    try {
      const res = await fetch(`/api/admin/blocked?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('User successfully unblocked!');
        fetchBlockedUsers();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-semibold flex items-center justify-center min-h-[400px]">
        <span className="animate-spin text-2xl mr-2">🌀</span> Loading Payments & Transactions Data...
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const approvedPayments = payments.filter(p => p.status === 'Approved');
  const unusedTxCount = transactions.filter(t => t.status === 'Unused' || !t.status).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Payments & Access</h1>
        <p className="text-sm text-gray-500 mt-1">Approve pending subscription payments, manage user blocklists, track custom SMS and payment logs.</p>
      </div>

      {/* Tabs Control */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button 
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'payments' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🕒 Pending Payments ({pendingPayments.length})
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'history' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          ✅ Payment History ({approvedPayments.length})
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('sms_transactions')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'sms_transactions' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          💬 Phone SMS Transactions ({unusedTxCount})
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('blocked')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 transition-all ${activeTab === 'blocked' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          🚫 Blocked Users ({blockedUsers.length})
        </button>
      </div>

      {/* Tab 1: Pending Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Submitted Date</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">User Type</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Contributor Details</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Phone & Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Package Selected</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Method</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Transaction ID / Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments.map((pay) => (
                  <tr key={pay._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(pay.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {pay.licenseId || pay.userId ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit shadow-sm">
                          <span>🔄</span> Renewing
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit shadow-sm">
                          <span>✨</span> New User
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {pay.name}
                      {pay.licenseId && (
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">Renewing: {pay.licenseId.api_key}</div>
                      )}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-700">
                      <div>{pay.mobile}</div>
                      <div className="text-gray-400">{pay.email}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      {pay.packageId?.name || 'Custom Package'}
                    </td>
                    <td className="p-4 text-xs font-bold text-purple-700 whitespace-nowrap">
                      {pay.payment_method}
                    </td>
                    <td className="p-4 text-xs font-mono font-semibold text-gray-800 break-all">
                      {pay.trx_id}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      {pay.currency === 'USD' ? `$${pay.amount?.toFixed(2)}` : `৳${pay.amount}`}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 animate-pulse">
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePaymentAction(pay._id, 'Approve')}
                          disabled={processingPaymentId === pay._id}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePaymentAction(pay._id, 'Reject')}
                          disabled={processingPaymentId === pay._id}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handlePaymentAction(pay._id, 'Block')}
                          disabled={processingPaymentId === pay._id}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingPayments.length === 0 && (
                  <tr>
                    <td colSpan="10" className="p-8 text-center text-gray-500">No pending payment requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payment History (Approved) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Approved Date</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">User Name</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Phone & Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Package</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Method</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">TrxID / Ref Note</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedPayments.map((pay) => (
                  <tr key={pay._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(pay.updatedAt || pay.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {pay.name}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-700">
                      <div>{pay.mobile}</div>
                      <div className="text-gray-400">{pay.email}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      {pay.packageId?.name || 'Custom Package'}
                    </td>
                    <td className="p-4 text-xs font-bold text-blue-700 whitespace-nowrap">
                      {pay.payment_method}
                    </td>
                    <td className="p-4 text-xs font-mono font-semibold text-gray-800 break-all">
                      {pay.trx_id}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      {pay.currency === 'USD' ? `$${pay.amount?.toFixed(2)}` : `৳${pay.amount}`}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {approvedPayments.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">No approved payments history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Transactions (SMS webhook raw logs) */}
      {activeTab === 'sms_transactions' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Received Time</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Provider</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Transaction ID (TrxID)</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Amount Paid</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Usage Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700 uppercase">
                        {tx.paymentProvider || 'bkash'}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-gray-800 whitespace-nowrap">
                      {tx.trxId}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      ৳{tx.amountPaid}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        tx.status === 'Matched' ? 'bg-green-100 text-green-700' :
                        tx.status === 'AmountMismatch' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {tx.status || 'Unused'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleTransactionStatus(tx._id, tx.status || 'Unused')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            tx.status === 'Matched' 
                              ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' 
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          }`}
                          title="Click to toggle status"
                        >
                          {tx.status === 'Matched' ? 'Mark Unused' : 'Mark Used'}
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded text-xs font-bold transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No phone SMS transactions found. Ensure Android app is running.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Blocked Users */}
      {activeTab === 'blocked' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Blocked Date</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Name</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Email</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Mobile</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Reason</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.map((u) => (
                  <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(u.blockedAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      {u.name || 'N/A'}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-700 whitespace-nowrap">
                      {u.email || 'N/A'}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-red-600 whitespace-nowrap">
                      {u.mobile || 'N/A'}
                    </td>
                    <td className="p-4 text-xs text-gray-600">
                      {u.reason}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => unblockUser(u._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-sm"
                      >
                        Unblock & Allow Account
                      </button>
                    </td>
                  </tr>
                ))}
                {blockedUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No blocked users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
