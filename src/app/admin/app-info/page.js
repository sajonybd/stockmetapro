'use client';
import { useState, useEffect } from 'react';

export default function AdminAppInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppInfo = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/admin/app-info?t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching app release info:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppInfo();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-semibold flex items-center justify-center min-h-[400px]">
        <span className="animate-spin text-2xl mr-2">🌀</span> Fetching GitHub Release Status...
      </div>
    );
  }

  const latest = data?.latest;
  const oldReleases = data?.old_releases || [];

  return (
    <div className="p-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📱</span> Latest App Releases & Build Info
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time synchronization status with GitHub Releases. Shows what version your desktop app & website are currently serving.
          </p>
        </div>

        <button
          onClick={fetchAppInfo}
          disabled={refreshing}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow flex items-center gap-2 w-fit disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span> {refreshing ? 'Syncing GitHub...' : 'Sync GitHub Status'}
        </button>
      </div>

      {/* Currently Active Latest Version Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 mb-8 text-white shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                ✓ CURRENT ACTIVE LATEST RELEASE
              </span>
              <span className="text-xs text-slate-400">
                Published: {latest?.published_at ? new Date(latest.published_at).toLocaleString() : 'N/A'}
              </span>
            </div>

            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              {latest?.tag_name || 'v1.0.0.1'}
            </h2>
            <p className="text-slate-300 font-semibold text-sm mb-4">
              {latest?.name || 'StockMetaPro Latest Build'}
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 max-w-2xl font-mono text-xs text-slate-300 break-all space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>DOWNLOAD TARGET URL (SERVER & APP API)</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="text-emerald-300 font-semibold selection:bg-emerald-900">
                {latest?.download_url}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
            <a
              href={latest?.download_url}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm px-5 py-3 rounded-xl transition-all shadow-lg text-center flex items-center justify-center gap-2"
            >
              <span>📥</span> Test Download Exe
            </a>
            {latest?.html_url && (
              <a
                href={latest.html_url}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-center flex items-center justify-center gap-2"
              >
                <span>🔗</span> View on GitHub
              </a>
            )}
            <div className="text-center text-[11px] text-slate-400 mt-1">
              Asset: <span className="text-slate-200 font-medium">{latest?.asset_name || 'StockMetaPro_Setup.exe'}</span> ({latest?.asset_size_mb || 'N/A'} MB)
            </div>
          </div>
        </div>

        {/* Release Notes */}
        {latest?.body && (
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Release Notes Summary:</div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {latest.body}
            </pre>
          </div>
        )}
      </div>

      {/* Previous / Old Release History Column */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>📜</span> Previous Releases History ({oldReleases.length})
          </h3>
          <span className="text-xs text-gray-500">Older release archives stored on GitHub</span>
        </div>

        {oldReleases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-3.5">Version Tag</th>
                  <th className="p-3.5">Release Title</th>
                  <th className="p-3.5">Published Date</th>
                  <th className="p-3.5">Setup File</th>
                  <th className="p-3.5 text-right">Download Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {oldReleases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-gray-800">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                        {rel.tag_name}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-gray-800">{rel.name}</td>
                    <td className="p-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(rel.published_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-xs text-gray-600 font-mono">
                      {rel.asset_name} ({rel.asset_size_mb} MB)
                    </td>
                    <td className="p-3.5 text-right">
                      <a
                        href={rel.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      >
                        <span>📥</span> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
            No older release archives found on GitHub. All new releases will automatically appear here when published!
          </div>
        )}
      </div>
    </div>
  );
}
