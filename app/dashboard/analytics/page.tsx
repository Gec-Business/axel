'use client';

import { useState, useEffect } from 'react';
import type { Post, Platform } from '@/lib/constants';
import { PLATFORM_INFO } from '@/lib/constants';
import AnalyticsCard from '@/components/dashboard/AnalyticsCard';
import PostCard from '@/components/dashboard/PostCard';

interface PostAnalytics {
  post: Post;
  metrics: Record<string, { likes: number; comments: number; shares: number; reach?: number; impressions?: number } | null>;
}

export default function AnalyticsPage() {
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch('/api/posts?status=posted');
        const posts: Post[] = await res.json();

        const analytics: PostAnalytics[] = [];
        for (const post of posts.slice(0, 10)) {
          try {
            const metricsRes = await fetch(`/api/posts/${post.id}/analytics`);
            const metrics = metricsRes.ok ? await metricsRes.json() : {};
            analytics.push({ post, metrics });
          } catch {
            analytics.push({ post, metrics: {} });
          }
        }
        setPostAnalytics(analytics);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {postAnalytics.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-sm">No published posts with analytics yet.</p>
        </div>
      )}

      {postAnalytics.map(({ post, metrics }) => (
        <div key={post.id} className="space-y-4">
          <PostCard post={post} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4">
            {(post.platforms as Platform[]).map(p => (
              <AnalyticsCard
                key={p}
                platform={PLATFORM_INFO[p].name}
                color={PLATFORM_INFO[p].color}
                metrics={metrics[p] || null}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
