import { PLATFORM_INFO, type Platform } from '@/lib/constants';

export default function PlatformBadge({ platform }: { platform: Platform }) {
  const info = PLATFORM_INFO[platform];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-white uppercase"
      style={{ backgroundColor: info.color }}
    >
      {info.iconLabel}
    </span>
  );
}
