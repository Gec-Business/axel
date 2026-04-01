'use client';

import { useState, useEffect, use } from 'react';
import type { Post, Platform } from '@/lib/constants';
import PostPreview from '@/components/dashboard/PostPreview';

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`).then(r => r.json()).then(setPost).catch(() => {});
  }, [id]);

  if (!post) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="animate-fade-up">
      <p className="text-sm text-text-muted mb-6">Preview how this post will appear on each platform</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(post.platforms as Platform[]).map(p => (
          <div key={p}>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">{p}</h3>
            <PostPreview post={post} platform={p} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <a href={`/dashboard/posts/${id}/edit`}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors">
          Edit Post
        </a>
        <a href="/dashboard" className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          Back
        </a>
      </div>
    </div>
  );
}
