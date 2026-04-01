'use client';

import { useState } from 'react';
import type { Post, Platform } from '@/lib/constants';
import ApprovalStatusBadge from './ApprovalStatusBadge';
import ContentPillarBadge from './ContentPillarBadge';
import PlatformBadge from './PlatformBadge';
import CopyButton from './CopyButton';

interface PostCardProps {
  post: Post;
  onApprove?: (id: string) => void;
  onPostNow?: (id: string, platform: Platform) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  variant?: 'default' | 'today' | 'overdue';
}

export default function PostCard({ post, onApprove, onPostNow, selectable, selected, onSelect, variant = 'default' }: PostCardProps) {
  const [langTab, setLangTab] = useState<'ka' | 'en'>('ka');
  const [expanded, setExpanded] = useState(false);

  const borderColor = variant === 'today' ? 'border-l-blue-500' : variant === 'overdue' ? 'border-l-red-400' : 'border-l-transparent';
  const date = new Date(post.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={`bg-white rounded-xl border border-border border-l-4 ${borderColor} p-4 hover:shadow-sm transition-all`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {selectable && (
          <input type="checkbox" checked={selected} onChange={() => onSelect?.(post.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-accent" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-medium text-text-muted">{date}</span>
            {post.scheduled_time && <span className="text-xs text-text-muted">{post.scheduled_time}</span>}
            <ApprovalStatusBadge status={post.status} />
            <ContentPillarBadge pillar={post.pillar} />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            {post.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
            <span className="text-xs text-text-muted ml-1">{post.content_type.replace('_', ' ')}</span>
          </div>

          {/* Bilingual copy */}
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              <button onClick={() => setLangTab('ka')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded ${langTab === 'ka' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                ქართ
              </button>
              <button onClick={() => setLangTab('en')}
                className={`px-2 py-0.5 text-[11px] font-medium rounded ${langTab === 'en' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                EN
              </button>
              <CopyButton text={langTab === 'ka' ? post.copy_ka : post.copy_en} />
            </div>
            <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
              {langTab === 'ka' ? post.copy_ka : post.copy_en}
            </p>
          </div>

          {/* Expandable details */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-border-light space-y-2 animate-fade-up">
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map(h => (
                    <span key={h} className="text-xs text-accent bg-accent-light px-1.5 py-0.5 rounded">{h}</span>
                  ))}
                </div>
              )}
              {post.notes && <p className="text-xs text-text-muted italic">{post.notes}</p>}
              {/* Per-platform publish results */}
              {post.publish_results && (
                <div className="flex gap-3">
                  {Object.entries(post.publish_results).map(([p, r]) => (
                    <div key={p} className="text-xs">
                      <span className="font-medium">{p}:</span>{' '}
                      <span className={r.posted ? 'text-emerald-600' : 'text-red-500'}>
                        {r.posted ? 'Posted' : r.error || 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-light">
        <button onClick={() => setExpanded(!expanded)}
          className="text-xs text-text-muted hover:text-text-primary transition-colors">
          {expanded ? 'Less' : 'More'}
        </button>
        <div className="flex-1" />
        {post.status === 'draft' && onApprove && (
          <button onClick={() => onApprove(post.id)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            Approve
          </button>
        )}
        {(post.status === 'approved' || post.status === 'draft') && onPostNow && post.platforms.map(p => (
          !post.publish_results?.[p]?.posted && (
            <button key={p} onClick={() => onPostNow(post.id, p)}
              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: PLATFORM_INFO_COLORS[p] }}>
              Post {p.charAt(0).toUpperCase() + p.slice(1, 2)}
            </button>
          )
        ))}
        <a href={`/dashboard/posts/${post.id}/edit`}
          className="text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1">
          Edit
        </a>
        <a href={`/dashboard/posts/${post.id}/preview`}
          className="text-xs text-accent hover:text-accent/80 transition-colors px-2 py-1">
          Preview
        </a>
      </div>
    </div>
  );
}

const PLATFORM_INFO_COLORS: Record<string, string> = { facebook: '#1877F2', instagram: '#E4405F', linkedin: '#0A66C2' };
