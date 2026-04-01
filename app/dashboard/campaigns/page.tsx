'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Campaign } from '@/lib/constants';
import CampaignCard from '@/components/dashboard/CampaignCard';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', name_ka: '', pillar: 'general', start_date: '', end_date: '', description: '' });

  useEffect(() => {
    fetch('/api/campaigns').then(r => r.json()).then(setCampaigns).catch(() => {});
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, status: 'planning' }),
    });
    setShowForm(false);
    setForm({ name: '', name_ka: '', pillar: 'general', start_date: '', end_date: '', description: '' });
    const res = await fetch('/api/campaigns');
    setCampaigns(await res.json());
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors">
          + New Campaign
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-border p-5 space-y-4 animate-fade-up">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Campaign name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            <input placeholder="ქართული სახელი" value={form.name_ka} onChange={e => setForm(f => ({ ...f, name_ka: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm">
              {['general', 'academy', 'members', 'events', 'portfolio'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required
              className="border border-border rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required
              className="border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-text-muted">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {campaigns.map(c => (
          <Link key={c.id} href={`/dashboard/campaigns/${c.id}`}>
            <CampaignCard campaign={c} />
          </Link>
        ))}
      </div>

      {campaigns.length === 0 && !showForm && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-sm">No campaigns yet.</p>
        </div>
      )}
    </div>
  );
}
