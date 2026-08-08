'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  const [appInfo, setAppInfo] = useState({
    latest_version: '1.0.0.3',
    download_url: 'https://github.com/sajonybd/stockmetapro/releases/latest/download/StockMetaPro_Setup.exe',
    release_notes: 'Latest release v1.0.0.3 with enhanced performance & security updates.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestUpdate() {
      try {
        const res = await fetch('/api/software/check_update');
        const data = await res.json();
        if (data && data.download_url) {
          setAppInfo(data);
        }
      } catch (err) {
        console.error('Failed fetching software update info:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestUpdate();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">StockMetaPro</span>
              <span className="text-xs text-blue-400 block font-medium">Desktop Edition</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Home Page
            </Link>
            <a 
              href={appInfo.download_url} 
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
            >
              <span>📥</span> Direct Download
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 w-full flex flex-col items-center justify-center">
        
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-800/60 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          OFFICIAL DESKTOP SOFTWARE RELEASE
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-center text-white tracking-tight leading-tight mb-4">
          Download <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500 bg-clip-text text-transparent">StockMetaPro</span> Desktop
        </h1>
        <p className="text-slate-400 text-base md:text-lg text-center max-w-2xl mb-10 leading-relaxed">
          The ultimate automation & metadata contributor app. Download the official setup below and activate your account using your license key.
        </p>

        {/* Featured Latest Release Box */}
        <div className="w-full bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
                  LATEST RELEASE
                </span>
                <span className="text-xs font-semibold text-slate-400">Windows 10 / 11 (64-bit)</span>
              </div>

              <div className="flex items-baseline justify-center md:justify-start gap-3">
                <h2 className="text-3xl font-extrabold text-white">
                  v{appInfo.latest_version}
                </h2>
                <span className="text-xs text-slate-500 font-mono">StockMetaPro_Setup.exe</span>
              </div>

              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {appInfo.release_notes}
              </p>
            </div>

            {/* Download Action Area */}
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
              <a
                href={appInfo.download_url}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-base px-8 py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-center flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="text-xl">📥</span>
                <span>Download App (v{appInfo.latest_version})</span>
              </a>
              <span className="text-[11px] text-slate-500 mt-2 font-medium">
                Verified Clean & Virus-Free • Official Build
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Setup Guide */}
        <div className="w-full">
          <h3 className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">
            HOW TO INSTALL & GET STARTED
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 font-bold text-sm flex items-center justify-center mx-auto mb-3 border border-blue-800/60">
                1
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Download Setup</h4>
              <p className="text-xs text-slate-400">Click the button above to download the latest setup file to your PC.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 font-bold text-sm flex items-center justify-center mx-auto mb-3 border border-blue-800/60">
                2
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Run Installer</h4>
              <p className="text-xs text-slate-400">Open <code className="text-blue-400">StockMetaPro_Setup.exe</code> and follow installation prompts.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-950 text-blue-400 font-bold text-sm flex items-center justify-center mx-auto mb-3 border border-blue-800/60">
                3
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Activate License</h4>
              <p className="text-xs text-slate-400">Enter the License Key sent to your email to activate and start using the app.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} StockMetaPro. All rights reserved.
      </footer>
    </div>
  );
}
