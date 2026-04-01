'use client';

import { useState, useEffect } from 'react';
import type { Asset } from '@/lib/constants';
import AssetUploader from '@/components/dashboard/AssetUploader';
import AssetGallery from '@/components/dashboard/AssetGallery';
import { useToast } from '@/components/ui/Toast';

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const fetchAssets = () => {
    fetch('/api/assets').then(r => r.json()).then(setAssets).catch(() => {});
  };

  useEffect(() => { fetchAssets(); }, []);

  const upload = async (file: File, meta: { name: string; category: string; tags: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', meta.name);
    formData.append('category', meta.category);
    formData.append('tags', meta.tags);

    const res = await fetch('/api/assets', { method: 'POST', body: formData });
    if (res.ok) {
      toast('Asset uploaded', 'success');
      fetchAssets();
    } else {
      const data = await res.json();
      toast(data.error || 'Upload failed', 'error');
    }
  };

  const deleteAsset = async (id: string) => {
    await fetch(`/api/assets/${id}`, { method: 'DELETE' });
    toast('Asset deleted', 'success');
    fetchAssets();
  };

  const filtered = filter === 'all' ? assets
    : filter === 'images' ? assets.filter(a => a.mime_type.startsWith('image/'))
    : assets.filter(a => a.mime_type.startsWith('video/'));

  return (
    <div className="space-y-6 animate-fade-up">
      <AssetUploader onUpload={upload} />

      <div className="flex items-center gap-2">
        {['all', 'images', 'videos'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === f ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? assets.length : f === 'images' ? assets.filter(a => a.mime_type.startsWith('image/')).length : assets.filter(a => a.mime_type.startsWith('video/')).length})
          </button>
        ))}
      </div>

      <AssetGallery assets={filtered} onDelete={deleteAsset} />
    </div>
  );
}
