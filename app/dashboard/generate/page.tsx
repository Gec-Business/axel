'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CONTENT_PILLARS, PLATFORM_INFO, type ContentPillar, type Platform } from '@/lib/constants';
import PostCard from '@/components/dashboard/PostCard';
import { useToast } from '@/components/ui/Toast';

interface GeneratedPost {
  scheduled_date: string;
  platforms: Platform[];
  content_type: string;
  pillar: ContentPillar;
  topic: string;
  goal: string;
  copy_ka: string;
  copy_en: string;
  hashtags: string[];
  copy_ka_linkedin?: string;
  copy_en_linkedin?: string;
  copy_ka_instagram?: string;
  copy_en_instagram?: string;
  suggested_time?: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);

  const [form, setForm] = useState({
    pillar: 'general' as ContentPillar,
    dateStart: new Date().toISOString().slice(0, 10),
    dateEnd: addDays(new Date().toISOString().slice(0, 10), 14),
    postsPerWeek: 3,
    platforms: ['facebook', 'instagram', 'linkedin'] as Platform[],
    context: '',
    targetAudience: '',
  });

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillar: form.pillar,
          dateRange: { start: form.dateStart, end: form.dateEnd },
          postsPerWeek: form.postsPerWeek,
          platforms: form.platforms,
          contentTypes: ['image_post'],
          context: form.context,
          targetAudience: form.targetAudience,
        }),
      });
      const data = await res.json();
      if (data.posts) {
        setResults(data.posts);
        toast(`Generated ${data.posts.length} posts`, 'success');
      } else {
        toast(data.error || 'Generation failed', 'error');
      }
    } catch {
      toast('Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (post: GeneratedPost) => {
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, status: 'draft', ai_generated: true }),
    });
    toast('Added to calendar as draft', 'success');
    setResults(prev => prev.filter(p => p !== post));
  };

  const addAll = async () => {
    for (const post of results) {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, status: 'draft', ai_generated: true }),
      });
    }
    toast(`Added ${results.length} posts to calendar`, 'success');
    setResults([]);
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-up">
      {/* Generation Form */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Content Pillar</label>
            <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value as ContentPillar }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm">
              {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map(p => (
                <option key={p} value={p}>{CONTENT_PILLARS[p].name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Posts per Week</label>
            <input type="number" min={1} max={7} value={form.postsPerWeek}
              onChange={e => setForm(f => ({ ...f, postsPerWeek: Number(e.target.value) }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Start Date</label>
            <input type="date" value={form.dateStart} onChange={e => setForm(f => ({ ...f, dateStart: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">End Date</label>
            <input type="date" value={form.dateEnd} onChange={e => setForm(f => ({ ...f, dateEnd: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Platforms</label>
          <div className="flex gap-2">
            {(Object.keys(PLATFORM_INFO) as Platform[]).map(p => (
              <button key={p} type="button"
                onClick={() => setForm(f => ({
                  ...f,
                  platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
                }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  form.platforms.includes(p) ? 'text-white' : 'bg-gray-100 text-gray-400'
                }`}
                style={form.platforms.includes(p) ? { backgroundColor: PLATFORM_INFO[p].color } : undefined}>
                {PLATFORM_INFO[p].name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Additional Context</label>
          <textarea value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
            rows={3} placeholder="E.g., Academy Batch 3 starts April 20, focus on urgency and early bird pricing..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Target Audience</label>
          <input type="text" value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
            placeholder="E.g., Georgian startup founders aged 25-45"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>

        <button onClick={generate} disabled={loading}
          className="w-full py-3 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-colors disabled:opacity-50">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : 'Generate Content'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
              Generated {results.length} posts
            </h3>
            <button onClick={addAll}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors">
              Add All to Calendar
            </button>
          </div>
          {results.map((post, i) => (
            <div key={i} className="relative">
              <PostCard post={{ ...post, id: `gen-${i}`, created_at: '', updated_at: '', status: 'draft' } as any} />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => addToCalendar(post)}
                  className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent/90 transition-colors">
                  Add to Calendar
                </button>
                <button onClick={() => setResults(prev => prev.filter((_, j) => j !== i))}
                  className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors">
                  Discard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
