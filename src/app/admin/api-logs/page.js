'use client';
import { useState, useEffect } from 'react';

export default function ApiLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewLog, setViewLog] = useState(null);

  const fetchLogs = async (pageNum) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/api-logs?page=${pageNum}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Software API Logs</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Monitor all incoming requests from the C software. Use this to debug issues.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">Time</th>
                <th className="p-4 font-semibold text-gray-600">Endpoint</th>
                <th className="p-4 font-semibold text-gray-600">Method</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-700">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-mono text-sm text-blue-600">{log.endpoint}</td>
                  <td className="p-4 font-mono text-xs font-bold text-gray-500">{log.method}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.status_code === 200 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.status_code}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setViewLog(log)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                      View JSON
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <button 
          disabled={page <= 1} 
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages || 1}</span>
        <button 
          disabled={page >= totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {viewLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Log Details</h2>
              <button onClick={() => setViewLog(null)} className="text-gray-400 hover:text-gray-600 font-bold">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Request Payload</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto shadow-inner">
                  {JSON.stringify(viewLog.request_payload, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Response Payload (Status: {viewLog.status_code})</h3>
                <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm font-mono overflow-x-auto shadow-inner">
                  {JSON.stringify(viewLog.response_payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
