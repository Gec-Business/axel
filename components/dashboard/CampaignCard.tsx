import type { Campaign } from '@/lib/constants';
import ContentPillarBadge from './ContentPillarBadge';

export default function CampaignCard({ campaign, postCount = 0 }: { campaign: Campaign; postCount?: number }) {
  const start = new Date(campaign.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(campaign.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <ContentPillarBadge pillar={campaign.pillar} />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          campaign.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
          campaign.status === 'completed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'
        }`}>
          {campaign.status}
        </span>
      </div>
      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">{campaign.name}</h3>
      {campaign.name_ka && <p className="text-sm text-text-secondary mt-0.5">{campaign.name_ka}</p>}
      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
        <span>{start} &mdash; {end}</span>
        <span>{postCount} posts</span>
      </div>
    </div>
  );
}
