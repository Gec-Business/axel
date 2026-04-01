'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Post } from '@/lib/constants';
import CalendarGrid from '@/components/dashboard/CalendarGrid';
import PostCard from '@/components/dashboard/PostCard';

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts).catch(() => {});
  }, []);

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const selectedPosts = useMemo(() =>
    selectedDate ? posts.filter(p => p.scheduled_date === selectedDate) : [],
    [posts, selectedDate]
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <h2 className="text-lg font-bold text-text-primary min-w-[180px] text-center">{monthLabel}</h2>
          <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
        <a href={`/dashboard/posts/new?date=${selectedDate || new Date().toISOString().slice(0, 10)}`}
          className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors">
          + New Post
        </a>
      </div>

      <CalendarGrid year={year} month={month} posts={posts} onDateClick={setSelectedDate} selectedDate={selectedDate} />

      {selectedDate && (
        <div className="animate-fade-up">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            {new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' '}&middot; {selectedPosts.length} post{selectedPosts.length !== 1 ? 's' : ''}
          </h3>
          {selectedPosts.length > 0 ? (
            <div className="space-y-3">{selectedPosts.map(p => <PostCard key={p.id} post={p} />)}</div>
          ) : (
            <p className="text-sm text-text-muted">No posts scheduled for this date.</p>
          )}
        </div>
      )}
    </div>
  );
}
