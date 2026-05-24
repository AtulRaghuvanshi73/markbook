"use client";

import type { Bookmark } from "./BookmarkDashboard";
import BookmarkItem from "./BookmarkItem";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  isLoading: boolean;
  onBookmarkDeleted: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  isLoading,
  onBookmarkDeleted,
}: BookmarkListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 px-6 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-brand-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          No bookmarks yet
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          Save your first bookmark using the form above. It&apos;ll appear here
          instantly.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          Add your first bookmark above
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bookmarks.map((bookmark, index) => (
        <div
          key={bookmark.id}
          style={{ animationDelay: `${index * 30}ms` }}
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          <BookmarkItem
            bookmark={bookmark}
            onDeleted={onBookmarkDeleted}
          />
        </div>
      ))}
    </div>
  );
}
