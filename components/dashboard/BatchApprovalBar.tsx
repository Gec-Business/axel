'use client';

interface BatchApprovalBarProps {
  count: number;
  onApprove: () => void;
  onClear: () => void;
  loading?: boolean;
}

export default function BatchApprovalBar({ count, onApprove, onClear, loading }: BatchApprovalBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-up">
      <div className="flex items-center gap-4 bg-gray-900 text-white rounded-full px-6 py-3 shadow-2xl">
        <span className="text-sm font-medium">{count} post{count > 1 ? 's' : ''} selected</span>
        <button
          onClick={onApprove}
          disabled={loading}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
        >
          {loading ? 'Approving...' : 'Approve All'}
        </button>
        <button onClick={onClear} className="text-gray-400 hover:text-white text-sm transition-colors">
          Clear
        </button>
      </div>
    </div>
  );
}
