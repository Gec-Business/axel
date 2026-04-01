'use client';

import { useState, useEffect } from 'react';
import type { Asset } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import AssetGallery from './AssetGallery';

interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  initialSelected?: string[];
}

export default function AssetPicker({ open, onClose, onConfirm, initialSelected = [] }: AssetPickerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);

  useEffect(() => {
    if (open) {
      fetch('/api/assets').then(r => r.json()).then(setAssets).catch(() => {});
      setSelected(initialSelected);
    }
  }, [open, initialSelected]);

  const toggle = (asset: Asset) => {
    setSelected(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Select Assets" wide>
      <AssetGallery assets={assets} onSelect={toggle} selectable selectedIds={selected} />
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</button>
        <button onClick={() => { onConfirm(selected); onClose(); }}
          className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors">
          Select {selected.length > 0 ? `(${selected.length})` : ''}
        </button>
      </div>
    </Modal>
  );
}
