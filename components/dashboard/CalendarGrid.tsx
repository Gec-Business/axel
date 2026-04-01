'use client';

import { useMemo } from 'react';
import { CONTENT_PILLARS, type Post, type ContentPillar } from '@/lib/constants';

interface CalendarGridProps {
  year: number;
  month: number;
  posts: Post[];
  onDateClick: (date: string) => void;
  selectedDate?: string;
}

export default function CalendarGrid({ year, month, posts, onDateClick, selectedDate }: CalendarGridProps) {
  const { days, startDay } = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days: daysInMonth, startDay: firstDay };
  }, [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const p of posts) {
      const d = p.scheduled_date;
      if (!map[d]) map[d] = [];
      map[d].push(p);
    }
    return map;
  }, [posts]);

  const today = new Date().toISOString().slice(0, 10);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
        {weekDays.map(d => (
          <div key={d} className="bg-surface-alt px-2 py-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-b-lg overflow-hidden">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-surface-alt h-24" />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayPosts = postsByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              onClick={() => onDateClick(dateStr)}
              className={`bg-white h-24 p-2 text-left hover:bg-accent-light/30 transition-colors relative
                ${isToday ? 'ring-2 ring-accent ring-inset' : ''}
                ${isSelected ? 'bg-accent-light' : ''}`}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-accent font-bold' : 'text-text-primary'}`}>{day}</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dayPosts.slice(0, 4).map(p => (
                  <span key={p.id} className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CONTENT_PILLARS[p.pillar as ContentPillar]?.color || '#6B7280' }} />
                ))}
                {dayPosts.length > 4 && (
                  <span className="text-[9px] text-text-muted">+{dayPosts.length - 4}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
