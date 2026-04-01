'use client';

import PostForm from '@/components/dashboard/PostForm';

export default function NewPostPage() {
  return (
    <div className="animate-fade-up">
      <PostForm mode="create" />
    </div>
  );
}
