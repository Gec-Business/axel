'use client';

import { useState, useEffect } from 'react';
import type { Post, Platform } from '@/lib/constants';
import MetricCard from '@/components/dashboard/MetricCard';
import PostCard from '@/components/dashboard/PostCard';
import BatchApprovalBar from '@/components/dashboard/BatchApprovalBar';
import { useToast } from '@/components/ui/Toast';

export default function TodayPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) setPosts(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const drafts = posts.filter(p => p.status === 'draft');
  const todayPosts = posts.filter(p => p.scheduled_date === today && p.status !== 'draft');
  const overdue = posts.filter(p => p.scheduled_date < today && p.status === 'approved');
  const upcoming = posts.filter(p => p.scheduled_date > today && p.scheduled_date <= addDays(today, 7));
  const activeCampaigns = new Set(posts.filter(p => p.campaign_id).map(p => p.campaign_id)).size;

  const approve = async (id: string) => {
    await fetch(`/api/posts/${id}/approve`, { method: 'POST' });
    toast('Post approved', 'success');
    fetchPosts();
  };

  const postNow = async (id: string, platform: Platform) => {
    toast(`Publishing to ${platform}...`, 'info');
    const res = await fetch('/api/posts/publish-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, platform }),
    });
    const data = await res.json();
    toast(data.success ? `Posted to ${platform}!` : `Failed: ${data.error}`, data.success ? 'success' : 'error');
    fetchPosts();
  };

  const batchApprove = async () => {
    await fetch('/api/posts/batch-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected }),
    });
    toast(`${selected.length} posts approved`, 'success');
    setSelected([]);
    fetchPosts();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 stagger-children">
        <MetricCard label="Pending Approval" value={drafts.length} color="#f59e0b"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
        <MetricCard label="Posting Today" value={todayPosts.length} color="#3b82f6"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
        <MetricCard label="Overdue" value={overdue.length} color={overdue.length > 0 ? '#ef4444' : '#10b981'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 9v2m0 4h.01M12 3l9.09 16.36A1 1 0 0120.18 21H3.82a1 1 0 01-.91-1.64L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
        <MetricCard label="Active Campaigns" value={activeCampaigns} color="#8b5cf6"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
      </div>

      {/* Needs Approval */}
      {drafts.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Needs Approval ({drafts.length})
          </h2>
          <div className="space-y-3">
            {drafts.map(p => (
              <PostCard key={p.id} post={p} onApprove={approve} onPostNow={postNow}
                selectable selected={selected.includes(p.id)} onSelect={toggleSelect} />
            ))}
          </div>
        </section>
      )}

      {/* Today */}
      {todayPosts.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Today ({todayPosts.length})
          </h2>
          <div className="space-y-3">
            {todayPosts.map(p => <PostCard key={p.id} post={p} onPostNow={postNow} variant="today" />)}
          </div>
        </section>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">
            Overdue ({overdue.length})
          </h2>
          <div className="space-y-3">
            {overdue.map(p => <PostCard key={p.id} post={p} onPostNow={postNow} variant="overdue" />)}
          </div>
        </section>
      )}

      {/* Coming Up */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Coming Up (7 days)
          </h2>
          <div className="space-y-3">
            {upcoming.map(p => <PostCard key={p.id} post={p} onApprove={p.status === 'draft' ? approve : undefined} />)}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted">No posts yet. Create your first post!</p>
          <a href="/dashboard/posts/new" className="inline-block mt-4 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">
            Create Post
          </a>
        </div>
      )}

      <BatchApprovalBar count={selected.length} onApprove={batchApprove} onClear={() => setSelected([])} />
    </div>
  );
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
