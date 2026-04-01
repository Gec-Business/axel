import type { PostStatus } from '@/lib/constants';

const STATUS_STYLES: Record<PostStatus, { bg: string; text: string; label: string }> = {
  draft:      { bg: 'bg-gray-100',    text: 'text-gray-600',    label: 'Draft' },
  approved:   { bg: 'bg-blue-50',     text: 'text-blue-700',    label: 'Approved' },
  publishing: { bg: 'bg-amber-50',    text: 'text-amber-700',   label: 'Publishing' },
  posted:     { bg: 'bg-emerald-50',  text: 'text-emerald-700', label: 'Posted' },
  failed:     { bg: 'bg-red-50',      text: 'text-red-700',     label: 'Failed' },
};

export default function ApprovalStatusBadge({ status }: { status: PostStatus }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'publishing' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: 'currentColor' }} />
      {s.label}
    </span>
  );
}
