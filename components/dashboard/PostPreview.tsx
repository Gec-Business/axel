'use client';

import type { Post, Platform } from '@/lib/constants';

interface PostPreviewProps {
  post: Post;
  platform: Platform;
  imageUrl?: string;
}

export default function PostPreview({ post, platform, imageUrl }: PostPreviewProps) {
  const copyKa = (post as Record<string, string>)[`copy_ka_${platform}`] || post.copy_ka;
  const copyEn = (post as Record<string, string>)[`copy_en_${platform}`] || post.copy_en;
  const caption = `${copyKa}\n\n---\n\n${copyEn}${post.hashtags?.length ? '\n\n' + post.hashtags.join(' ') : ''}`;

  if (platform === 'facebook') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 max-w-md shadow-sm">
        <div className="p-3 flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">AX</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Axel Network</p>
            <p className="text-xs text-gray-500">Just now</p>
          </div>
        </div>
        <div className="px-3 pb-2">
          <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-6">{caption}</p>
        </div>
        {imageUrl && <img src={imageUrl} alt="Preview" className="w-full aspect-video object-cover" />}
        <div className="px-3 py-2 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
          <span>Like</span><span>Comment</span><span>Share</span>
        </div>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 max-w-sm shadow-sm">
        <div className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-gray-800">AX</div>
          </div>
          <span className="text-sm font-semibold text-gray-900">axelnetwork</span>
        </div>
        {imageUrl ? (
          <img src={imageUrl} alt="Preview" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        <div className="p-3">
          <div className="flex gap-4 mb-2 text-gray-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.5"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-2.636-6.364" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M21 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="text-sm text-gray-800"><span className="font-semibold">axelnetwork</span> <span className="whitespace-pre-line line-clamp-3">{caption}</span></p>
        </div>
      </div>
    );
  }

  // LinkedIn
  return (
    <div className="bg-white rounded-lg border border-gray-200 max-w-md shadow-sm">
      <div className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold">AX</div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Axel Network</p>
          <p className="text-xs text-gray-500">Angel Investor Network &middot; Just now</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 whitespace-pre-line line-clamp-5">{caption}</p>
      </div>
      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full aspect-[1.91/1] object-cover" />}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-6 text-xs text-gray-500 font-medium">
        <span>Like</span><span>Comment</span><span>Repost</span><span>Send</span>
      </div>
    </div>
  );
}
