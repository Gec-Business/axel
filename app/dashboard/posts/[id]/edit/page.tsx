'use client';

import { useState, useEffect, use } from 'react';
import type { Post } from '@/lib/constants';
import PostForm from '@/components/dashboard/PostForm';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
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
      <PostForm mode="edit" initial={post} />
    </div>
  );
}
