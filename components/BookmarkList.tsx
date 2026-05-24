"use client";

import type { Bookmark } from "./BookmarkDashboard";
import BookmarkItem from "./BookmarkItem";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onBookmarkDeleted: (id: string) => void;
}

export default function BookmarkList({
  bookmarks,
  onBookmarkDeleted,
}: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="panel py-12 px-6 text-center shadow-panel">
        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-5 h-5 text-notion-faint"
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
        <p className="text-sm font-medium text-notion">No bookmarks yet</p>
        <p className="text-sm text-notion-muted mt-1">
          Paste a link above to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-notion-faint mb-3">
        All bookmarks
      </p>
      <div className="space-y-2">
        {bookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onDeleted={onBookmarkDeleted}
          />
        ))}
      </div>
    </div>
  );
}
