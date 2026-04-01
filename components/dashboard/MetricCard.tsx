interface MetricCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  subtext?: string;
}

export default function MetricCard({ label, value, icon, color = '#4f46e5', subtext }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="text-3xl font-bold tracking-tight mt-1" style={{ color }}>{value}</p>
          {subtext && <p className="text-xs text-text-muted mt-1">{subtext}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
