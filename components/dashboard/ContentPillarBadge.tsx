import { CONTENT_PILLARS, type ContentPillar } from '@/lib/constants';

export default function ContentPillarBadge({ pillar }: { pillar: ContentPillar }) {
  const info = CONTENT_PILLARS[pillar];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white"
      style={{ backgroundColor: info.color }}
    >
      {info.name}
    </span>
  );
}
