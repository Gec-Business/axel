'use client';

import { useState } from 'react';

interface BilingualEditorProps {
  copyKa: string;
  copyEn: string;
  onChangeKa: (val: string) => void;
  onChangeEn: (val: string) => void;
  rows?: number;
  disabled?: boolean;
}

export default function BilingualEditor({ copyKa, copyEn, onChangeKa, onChangeEn, rows = 5, disabled }: BilingualEditorProps) {
  const [tab, setTab] = useState<'ka' | 'en'>('ka');

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex border-b border-border bg-surface-alt">
        <button
          type="button"
          onClick={() => setTab('ka')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'ka' ? 'text-accent border-b-2 border-accent bg-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          ქართული
        </button>
        <button
          type="button"
          onClick={() => setTab('en')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'en' ? 'text-accent border-b-2 border-accent bg-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          English
        </button>
      </div>
      <textarea
        value={tab === 'ka' ? copyKa : copyEn}
        onChange={e => tab === 'ka' ? onChangeKa(e.target.value) : onChangeEn(e.target.value)}
        rows={rows}
        disabled={disabled}
        placeholder={tab === 'ka' ? 'ქართული ტექსტი...' : 'English text...'}
        className="w-full px-4 py-3 text-sm resize-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
