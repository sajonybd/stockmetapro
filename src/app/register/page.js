'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setError(data.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create an Account</h2>
        <p className="text-gray-500 mb-8">Join StockMetaPro to get your API keys</p>
        
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 py-2 rounded-lg">{error}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input 
            type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-green-500 focus:border-green-500" required 
          />
          <input 
            type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-green-500 focus:border-green-500" required 
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-green-500 focus:border-green-500" required 
          />
          <button type="submit" disabled={loading} className="w-full bg-[#1f934b] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-gray-600 text-sm">
          Already have an account? <Link href="/login" className="text-green-600 font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
