'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Invalid password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h2v18H3V3zm4 10h2v8H7v-8zm4-5h2v13h-2V8zm4 7h2v6h-2v-6zm4-9h2v15h-2V6z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-8">StockMetaPro Admin Login</h2>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 py-2 rounded-lg">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <input 
              type="password" 
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1f934b] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
