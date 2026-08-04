'use client';
import { useState, useEffect } from 'react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const deleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this SMS transaction record?')) return;
    try {
      const res = await fetch(`/api/admin/transactions?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchTransactions();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (tx.trxId && tx.trxId.toLowerCase().includes(q)) ||
      (tx.sender && tx.sender.toLowerCase().includes(q)) ||
      (tx.amount && String(tx.amount).includes(q)) ||
      (tx.rawMessage && tx.rawMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">SMS Transactions Logs</h1>
        <button 
          onClick={fetchTransactions}
          className="bg-[#1f934b] text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
        >
          🔄 Refresh list
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">About SMS Transactions</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          These are the transaction SMS records forwarded from your mobile phone using the <strong>httpsms</strong> service.
          When a user inputs a Transaction ID, the system looks up this table for a match to auto-approve payment licenses.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <input 
            type="text"
            placeholder="Search by Transaction ID (TRXID), Sender number, Amount, or Raw Message body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-green-500 focus:border-green-500 text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading transactions...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Received Time</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Sender</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Transaction ID</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Amount</th>
                  <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Raw SMS Body</th>
                  <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(tx.createdAt || tx.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800 whitespace-nowrap">
                      {tx.sender}
                    </td>
                    <td className="p-4 text-sm font-mono font-bold text-blue-600 whitespace-nowrap">
                      {tx.trxId}
                    </td>
                    <td className="p-4 text-sm font-bold text-green-700 whitespace-nowrap">
                      ৳{tx.amount}
                    </td>
                    <td className="p-4 text-xs text-gray-600 max-w-md break-words">
                      {tx.rawMessage}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => deleteTransaction(tx._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No transaction records found matching search query.</td>
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
