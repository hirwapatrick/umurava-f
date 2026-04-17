'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { BrainCircuit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('umurava_user', JSON.stringify(data));
        dispatch(setCredentials({ user: data, token: data.token }));
        router.push('/');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('A network error occurred. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-[80px] opacity-20 -ml-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400 rounded-full blur-[80px] opacity-20 -mr-10 -mb-10 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 text-white mx-auto mb-4">
            <BrainCircuit size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Join Umurava AI</h1>
          <p className="text-slate-500 mt-2 text-sm">Create your Recruiter Account</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">First Name</label>
              <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white" placeholder="Jane" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 block">Last Name</label>
              <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white" placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">Email Address</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white" placeholder="recruiter@umurava.africa" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 block">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm bg-white" placeholder="••••••••" minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 mt-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6 pb-2 relative z-10">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
