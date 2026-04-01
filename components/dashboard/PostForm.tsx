'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, Platform, ContentType, ContentPillar } from '@/lib/constants';
import { CONTENT_PILLARS, PLATFORM_INFO } from '@/lib/constants';
import BilingualEditor from './BilingualEditor';
import PlatformCopyEditor from './PlatformCopyEditor';
import AssetPicker from './AssetPicker';

interface PostFormProps {
  initial?: Partial<Post>;
  mode: 'create' | 'edit';
}

export default function PostForm({ initial, mode }: PostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const [form, setForm] = useState({
    scheduled_date: initial?.scheduled_date || new Date().toISOString().slice(0, 10),
    scheduled_time: initial?.scheduled_time || '',
    platforms: initial?.platforms || ['facebook', 'instagram', 'linkedin'] as Platform[],
    content_type: initial?.content_type || 'image_post' as ContentType,
    pillar: initial?.pillar || 'general' as ContentPillar,
    topic: initial?.topic || '',
    goal: initial?.goal || '',
    copy_ka: initial?.copy_ka || '',
    copy_en: initial?.copy_en || '',
    hashtags: initial?.hashtags?.join(', ') || '',
    utm_link: initial?.utm_link || '',
    notes: initial?.notes || '',
    asset_ids: initial?.asset_ids || [] as string[],
    campaign_id: initial?.campaign_id || '',
    // Per-platform overrides stored as flat object
    copy_ka_facebook: initial?.copy_ka_facebook || '',
    copy_en_facebook: initial?.copy_en_facebook || '',
    copy_ka_instagram: initial?.copy_ka_instagram || '',
    copy_en_instagram: initial?.copy_en_instagram || '',
    copy_ka_linkedin: initial?.copy_ka_linkedin || '',
    copy_en_linkedin: initial?.copy_en_linkedin || '',
  });

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const togglePlatform = (p: Platform) => {
    set('platforms', form.platforms.includes(p) ? form.platforms.filter(x => x !== p) : [...form.platforms, p]);
  };

  const save = async (status: 'draft' | 'approved' = 'draft') => {
    setSaving(true);
    try {
      const body = {
        ...form,
        hashtags: form.hashtags.split(',').map(h => h.trim()).filter(Boolean),
        status,
        copy_ka_facebook: form.copy_ka_facebook || null,
        copy_en_facebook: form.copy_en_facebook || null,
        copy_ka_instagram: form.copy_ka_instagram || null,
        copy_en_instagram: form.copy_en_instagram || null,
        copy_ka_linkedin: form.copy_ka_linkedin || null,
        copy_en_linkedin: form.copy_en_linkedin || null,
        campaign_id: form.campaign_id || null,
        utm_link: form.utm_link || null,
        notes: form.notes || null,
        scheduled_time: form.scheduled_time || null,
      };

      if (mode === 'edit' && initial?.id) {
        await fetch(`/api/posts/${initial.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Date + Time + Type */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Date</label>
          <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Time (optional)</label>
          <input type="time" value={form.scheduled_time} onChange={e => set('scheduled_time', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Content Type</label>
          <select value={form.content_type} onChange={e => set('content_type', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
            {['image_post', 'carousel', 'reel', 'video', 'story', 'text_post'].map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Platforms</label>
        <div className="flex gap-2">
          {(Object.keys(PLATFORM_INFO) as Platform[]).map(p => (
            <button key={p} type="button" onClick={() => togglePlatform(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                form.platforms.includes(p)
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              style={form.platforms.includes(p) ? { backgroundColor: PLATFORM_INFO[p].color } : undefined}>
              {PLATFORM_INFO[p].name}
            </button>
          ))}
        </div>
      </div>

      {/* Pillar + Topic + Goal */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Pillar</label>
          <select value={form.pillar} onChange={e => set('pillar', e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
            {(Object.keys(CONTENT_PILLARS) as ContentPillar[]).map(p => (
              <option key={p} value={p}>{CONTENT_PILLARS[p].name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Topic</label>
          <input type="text" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="Post topic"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Goal</label>
          <input type="text" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="Awareness, Conversion..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
        </div>
      </div>

      {/* Default Bilingual Copy */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Caption (Default)</label>
        <BilingualEditor
          copyKa={form.copy_ka} copyEn={form.copy_en}
          onChangeKa={v => set('copy_ka', v)} onChangeEn={v => set('copy_en', v)}
        />
      </div>

      {/* Per-Platform Copy Overrides */}
      <PlatformCopyEditor
        platforms={form.platforms}
        values={form}
        onChange={(key, val) => set(key, val)}
      />

      {/* Hashtags */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Hashtags</label>
        <input type="text" value={form.hashtags} onChange={e => set('hashtags', e.target.value)}
          placeholder="#AxelNetwork, #AngelInvesting, #GeorgianStartups"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
      </div>

      {/* Assets */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Assets</label>
        <button type="button" onClick={() => setShowAssetPicker(true)}
          className="border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-text-secondary hover:bg-gray-50 hover:border-gray-400 transition-all w-full text-left">
          {form.asset_ids.length > 0 ? `${form.asset_ids.length} asset(s) selected` : 'Click to select assets...'}
        </button>
        <AssetPicker open={showAssetPicker} onClose={() => setShowAssetPicker(false)}
          onConfirm={ids => set('asset_ids', ids)} initialSelected={form.asset_ids} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Internal Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="Internal notes (not published)"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/30" />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button onClick={() => save('draft')} disabled={saving}
          className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-text-primary hover:bg-gray-50 transition-colors disabled:opacity-50">
          Save as Draft
        </button>
        <button onClick={() => save('approved')} disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
          Save &amp; Approve
        </button>
        <button onClick={() => router.back()} className="px-5 py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
