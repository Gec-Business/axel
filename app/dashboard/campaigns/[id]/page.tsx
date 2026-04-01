'use client';

import { useState, useEffect, use } from 'react';
import type { Campaign, Post } from '@/lib/constants';
import ContentPillarBadge from '@/components/dashboard/ContentPillarBadge';
import PostCard from '@/components/dashboard/PostCard';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`).then(r => r.json()).then(setCampaign).catch(() => {});
    fetch(`/api/posts?campaignId=${id}`).then(r => r.json()).then(setPosts).catch(() => {});
  }, [id]);

  if (!campaign) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const posted = posts.filter(p => p.status === 'posted').length;
  const total = posts.length;

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <ContentPillarBadge pillar={campaign.pillar} />
            <h2 className="text-xl font-bold text-text-primary mt-2">{campaign.name}</h2>
            {campaign.name_ka && <p className="text-sm text-text-secondary mt-0.5">{campaign.name_ka}</p>}
            {campaign.description && <p className="text-sm text-text-muted mt-2">{campaign.description}</p>}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            campaign.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
          }`}>{campaign.status}</span>
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm text-text-muted">
          <span>{new Date(campaign.start_date).toLocaleDateString()} &mdash; {new Date(campaign.end_date).toLocaleDateString()}</span>
          <span>{total} posts &middot; {posted} published</span>
        </div>
        {total > 0 && (
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${(posted / total) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-sm text-text-muted py-8">No posts in this campaign yet.</p>
      )}
    </div>
  );
}
