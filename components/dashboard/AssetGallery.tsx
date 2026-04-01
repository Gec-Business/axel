'use client';

import type { Asset } from '@/lib/constants';

interface AssetGalleryProps {
  assets: Asset[];
  onSelect?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selectedIds?: string[];
}

export default function AssetGallery({ assets, onSelect, onDelete, selectable, selectedIds = [] }: AssetGalleryProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No assets uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {assets.map(asset => {
        const isImage = asset.mime_type.startsWith('image/');
        const isSelected = selectedIds.includes(asset.id);
        const url = asset.public_url || asset.cloudinary_url || '';

        return (
          <div
            key={asset.id}
            onClick={() => onSelect?.(asset)}
            className={`group relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer
              ${isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-gray-200'}
              ${selectable ? 'hover:scale-[1.02]' : ''}`}
          >
            <div className="aspect-square bg-gray-100">
              {isImage && url ? (
                <img src={url} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4zM3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-[10px]">Video</span>
                </div>
              )}
            </div>
            <div className="p-2 bg-white">
              <p className="text-xs font-medium text-text-primary truncate">{asset.name}</p>
              <p className="text-[10px] text-text-muted">{(asset.size_bytes / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            {onDelete && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(asset.id); }}
                className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
