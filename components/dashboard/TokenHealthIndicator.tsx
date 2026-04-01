'use client';

interface TokenHealth {
  connected: boolean;
  error?: string;
  tokenExpiresIn?: number;
  refreshExpiresIn?: number | null;
}

export default function TokenHealthIndicator({ platform, health }: { platform: string; health: TokenHealth | null }) {
  if (!health) {
    return <div className="flex items-center gap-2 text-sm text-text-muted"><span className="w-2 h-2 rounded-full bg-gray-300" />Loading...</div>;
  }

  const isWarning = health.connected && health.tokenExpiresIn !== undefined && health.tokenExpiresIn < 14;
  const color = health.connected ? (isWarning ? '#f59e0b' : '#10b981') : '#ef4444';

  return (
    <div className="flex items-center gap-3">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <div>
        <p className="text-sm font-medium text-text-primary">{platform}</p>
        <p className="text-xs text-text-muted">
          {health.connected
            ? isWarning
              ? `Token expires in ${health.tokenExpiresIn} days`
              : 'Connected'
            : health.error || 'Not connected'}
        </p>
      </div>
    </div>
  );
}
