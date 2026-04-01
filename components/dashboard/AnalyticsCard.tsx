interface AnalyticsCardProps {
  platform: string;
  color: string;
  metrics: { likes: number; comments: number; shares: number; reach?: number; impressions?: number } | null;
}

export default function AnalyticsCard({ platform, color, metrics }: AnalyticsCardProps) {
  if (!metrics) {
    return (
      <div className="bg-white rounded-xl border border-border p-5 opacity-60">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-semibold">{platform}</span>
        </div>
        <p className="text-xs text-text-muted">No data available</p>
      </div>
    );
  }

  const stats = [
    { label: 'Likes', value: metrics.likes },
    { label: 'Comments', value: metrics.comments },
    { label: 'Shares', value: metrics.shares },
    ...(metrics.reach !== undefined ? [{ label: 'Reach', value: metrics.reach }] : []),
    ...(metrics.impressions !== undefined ? [{ label: 'Impressions', value: metrics.impressions }] : []),
  ];

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-text-primary">{platform}</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label}>
            <p className="text-2xl font-bold" style={{ color }}>{s.value.toLocaleString()}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
