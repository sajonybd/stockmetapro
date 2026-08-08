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
    <div className="min-h-screen bg-[#090514] text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Header - Identical to Homepage */}
      <header className="bg-[#0c091e] border-b border-purple-900/20 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/icons/Website Top Header Logo.png" alt="Stock Meta Pro Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Stock Meta Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-300">
            <Link href="/" className="hover:text-green-400 transition-colors">Home</Link>
            <a href="/#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="/#pricing" className="hover:text-green-400 transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-green-400 transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Main Hero & Download Section - Matching Homepage Gradients */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 w-full flex flex-col items-center justify-center relative">
        {/* Ambient background glow */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center leading-tight mb-4 bg-gradient-to-r from-blue-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
          Download Stock Meta Pro
        </h1>
        <p className="text-purple-200 text-sm md:text-base text-center max-w-2xl mb-10 leading-relaxed">
          The best SEO metadata generator tool for microstock contributors. Download the official setup below and activate your account using your license key.
        </p>

        {/* Featured Latest Release Box - Homepage Aesthetic */}
        <div className="w-full bg-[#130d2e]/80 border border-purple-900/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-12 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            
            {/* Left Side: Version Tag & Details */}
            <div className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  ✓ OFFICIAL LATEST RELEASE
                </span>
                <span className="text-xs font-medium text-purple-300">Windows (64-bit)</span>
              </div>

              <div className="flex items-baseline justify-center md:justify-start gap-3">
                <h2 className="text-3xl font-extrabold text-yellow-400 font-mono">
                  v{appInfo.latest_version}
                </h2>
                <span className="text-xs text-gray-400 font-mono">StockMetaPro_Setup.exe</span>
              </div>

              <p className="text-xs text-purple-200/80 max-w-md leading-relaxed">
                {appInfo.release_notes}
              </p>
            </div>

            {/* Right Side: Download Button (NO version text inside button) */}
            <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
              <a
                href={appInfo.download_url}
                className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-base px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-pink-500/30 text-center flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
              >
                <span className="text-xl">📥</span>
                <span>Download Software</span>
              </a>
              <span className="text-[11px] text-purple-300/60 mt-3 font-medium">
                Verified Clean & Virus-Free • Official Release
              </span>
            </div>
          </div>
        </div>

        {/* 3 Simple Steps Installation Section */}
        <div className="w-full">
          <h3 className="text-center text-sm font-bold text-purple-300 uppercase tracking-widest mb-6">
            3 Simple Installation Steps
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#130d2e]/50 border border-purple-900/30 rounded-2xl p-6 text-center">
              <span className="text-2xl font-extrabold text-purple-400 mb-2 block">1.</span>
              <h4 className="text-base font-bold text-white mb-2">Download Setup</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Click the Download Software button to get the setup file.</p>
            </div>

            <div className="bg-[#130d2e]/50 border border-purple-900/30 rounded-2xl p-6 text-center">
              <span className="text-2xl font-extrabold text-purple-400 mb-2 block">2.</span>
              <h4 className="text-base font-bold text-white mb-2">Run Installer</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Open <code className="text-yellow-400 font-mono">StockMetaPro_Setup.exe</code> and install the app.</p>
            </div>

            <div className="bg-[#130d2e]/50 border border-purple-900/30 rounded-2xl p-6 text-center">
              <span className="text-2xl font-extrabold text-purple-400 mb-2 block">3.</span>
              <h4 className="text-base font-bold text-white mb-2">Activate License</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Enter your License Key sent to your email to start using Stock Meta Pro.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer - Identical to Homepage */}
      <footer className="border-t border-purple-900/20 py-6 text-center text-xs text-purple-300/60 bg-[#0c091e]">
        © {new Date().getFullYear()} Stock Meta Pro. All rights reserved.
      </footer>
    </div>
  );
}
