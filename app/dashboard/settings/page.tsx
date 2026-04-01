'use client';

import { useState, useEffect } from 'react';
import TokenHealthIndicator from '@/components/dashboard/TokenHealthIndicator';

export default function SettingsPage() {
  const [health, setHealth] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch('/api/health/tokens').then(r => r.json()).then(setHealth).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      {/* Platform Connections */}
      <section className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-base font-bold text-text-primary mb-4">Platform Connections</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border-light">
            <TokenHealthIndicator platform="Facebook & Instagram (Meta)" health={health?.meta || null} />
          </div>
          <div className="flex items-center justify-between py-3">
            <TokenHealthIndicator platform="LinkedIn" health={health?.linkedin || null} />
            <a href="/api/linkedin"
              className="px-4 py-2 bg-[#0A66C2] text-white text-xs font-semibold rounded-lg hover:bg-[#0A66C2]/90 transition-colors">
              {health?.linkedin?.connected ? 'Reconnect' : 'Connect LinkedIn'}
            </a>
          </div>
        </div>
      </section>

      {/* Cron Info */}
      <section className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-base font-bold text-text-primary mb-2">Auto-Posting Schedule</h2>
        <p className="text-sm text-text-muted">
          The auto-poster runs daily at <strong>10:00 AM Tbilisi time</strong> (06:00 UTC) via GitHub Actions.
          It publishes all approved posts whose scheduled date has arrived.
        </p>
        <p className="text-xs text-text-muted mt-2">
          To trigger manually: go to the GitHub repo &rarr; Actions tab &rarr; Auto-Post &rarr; Run workflow.
        </p>
      </section>

      {/* API Keys Status */}
      <section className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-base font-bold text-text-primary mb-4">Configuration Status</h2>
        <div className="space-y-2">
          {[
            { label: 'ADMIN_PASSWORD', set: true },
            { label: 'META_PAGE_TOKEN', set: !!health?.meta?.connected },
            { label: 'META_IG_ACCOUNT_ID', set: !!health?.meta?.instagramId },
            { label: 'LINKEDIN_CLIENT_ID', set: !!health?.linkedin },
            { label: 'ANTHROPIC_API_KEY', set: true },
            { label: 'SUPABASE_URL', set: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${item.set ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span className="font-mono text-xs text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
