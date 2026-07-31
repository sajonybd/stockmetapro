"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function RenewPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setLicenseData(null);

    try {
      const res = await fetch('/api/renew/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (data.success) {
        setLicenseData(data.data);
      } else {
        setError(data.message || 'No license found.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Quick License Renewal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your Phone Number, Email Address, or License Key to extend your subscription and rollover unused credits.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10 border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Phone Number / Email / License Key
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 01700000000 or user@test.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Find License & Renew'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
              {error}
            </div>
          )}

          {licenseData && (
            <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">License Found:</h3>
                <p className="text-xs text-blue-800 font-mono">Key: {licenseData.licenseKey}</p>
                <p className="text-xs text-blue-800 mt-1">Status: 
                  <span className={`ml-1 font-bold ${licenseData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {licenseData.isActive ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </p>
                <p className="text-xs text-blue-800 mt-1">Available Credits: <span className="font-bold">{licenseData.currentCredits}</span></p>
                <p className="text-xs text-blue-800 mt-1">Expires On: {new Date(licenseData.expiresAt).toLocaleDateString()}</p>
              </div>

              {licenseData.isActive && (
                <p className="text-xs text-green-700 font-medium">
                  🎉 Rollover Active: Renewing now will carry forward your <strong>{licenseData.currentCredits} credits</strong> into your new plan!
                </p>
              )}

              <Link
                href={`/#pricing`}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 transition-colors"
              >
                Select Package to Renew
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
