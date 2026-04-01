'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Today',
  '/dashboard/calendar': 'Calendar',
  '/dashboard/campaigns': 'Campaigns',
  '/dashboard/assets': 'Asset Studio',
  '/dashboard/generate': 'AI Generate',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();

  let title = PAGE_TITLES[pathname] || '';
  if (pathname.startsWith('/dashboard/posts/') && pathname.includes('edit')) title = 'Edit Post';
  else if (pathname.startsWith('/dashboard/posts/new')) title = 'New Post';
  else if (pathname.startsWith('/dashboard/posts/') && pathname.includes('preview')) title = 'Post Preview';
  else if (pathname.startsWith('/dashboard/campaigns/') && pathname !== '/dashboard/campaigns') title = 'Campaign Detail';

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
      <h1 className="text-lg font-bold text-text-primary tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        <button
          onClick={async () => { await fetch('/api/auth', { method: 'DELETE' }); window.location.href = '/dashboard'; }}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
