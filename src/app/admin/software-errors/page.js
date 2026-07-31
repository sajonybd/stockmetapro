'use client';
import { useState, useEffect } from 'react';

export default function SoftwareErrorLogs() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/admin/software-errors');
      const data = await res.json();
      if (data.success) {
        setErrors(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch errors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Software Error Logs</h1>
        <button 
          onClick={fetchErrors}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-gray-600 font-semibold whitespace-nowrap">Date</th>
                <th className="p-4 text-gray-600 font-semibold">License Key</th>
                <th className="p-4 text-gray-600 font-semibold">Error Type</th>
                <th className="p-4 text-gray-600 font-semibold">App Ver.</th>
                <th className="p-4 text-gray-600 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading errors...</td></tr>
              ) : errors.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No software errors found.</td></tr>
              ) : (
                errors.map(err => (
                  <tr key={err._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(err.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">
                      {err.license_key ? err.license_key.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-medium text-red-600">
                      {err.error_type}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {err.app_version || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-800 break-all max-w-md">
                      {err.message || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
