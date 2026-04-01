'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { ToastProvider } from '@/components/ui/Toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/posts').then(r => {
      setAuthed(r.ok);
    }).catch(() => setAuthed(false));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setError('Invalid password');
    }
  };

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt">
        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <div className="w-full max-w-sm mx-4 animate-fade-up">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-base font-black">AX</span>
            </div>
            <div>
              <p className="text-white font-bold tracking-wide">AXEL NETWORK</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">Social Manager</p>
            </div>
          </div>
          <form onSubmit={login} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="Enter dashboard password"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button type="submit"
              className="w-full py-3 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface-alt">
        <Sidebar />
        <div className="pl-60">
          <TopBar />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
