'use client';

import { useState } from 'react';
import { PLATFORM_INFO, type Platform } from '@/lib/constants';
import BilingualEditor from './BilingualEditor';

interface PlatformCopyEditorProps {
  platforms: Platform[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}

export default function PlatformCopyEditor({ platforms, values, onChange }: PlatformCopyEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium mb-3 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${expanded ? 'rotate-90' : ''}`}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Customize per platform
      </button>

      {expanded && (
        <div className="space-y-4 pl-4 border-l-2 border-accent/20 animate-fade-up">
          {platforms.map(platform => {
            const info = PLATFORM_INFO[platform];
            return (
              <div key={platform}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                  <span className="text-sm font-medium text-text-primary">{info.name}</span>
                  <span className="text-xs text-text-muted">Override (leave empty to use default)</span>
                </div>
                <BilingualEditor
                  copyKa={values[`copy_ka_${platform}`] || ''}
                  copyEn={values[`copy_en_${platform}`] || ''}
                  onChangeKa={v => onChange(`copy_ka_${platform}`, v)}
                  onChangeEn={v => onChange(`copy_en_${platform}`, v)}
                  rows={3}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
