'use client';

import { useState, useRef, useCallback } from 'react';

interface AssetUploaderProps {
  onUpload: (file: File, metadata: { name: string; category: string; tags: string }) => Promise<void>;
}

export default function AssetUploader({ onUpload }: AssetUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await onUpload(file, { name: file.name, category: 'general', tags: '' });
      }
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
        ${dragging ? 'border-accent bg-accent-light scale-[1.01]' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input ref={inputRef} type="file" multiple accept="image/*,video/*" className="hidden"
        onChange={e => handleFiles(e.target.files)} />
      <div className="flex flex-col items-center gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-sm font-medium text-text-secondary">
          {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-xs text-text-muted">Images (JPEG, PNG, GIF) up to 10MB &middot; Videos (MP4, MOV) up to 100MB</p>
      </div>
    </div>
  );
}
