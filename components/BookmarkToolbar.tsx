"use client";

import type { BookmarkSort } from "@/lib/bookmarks";
import { SORT_LABELS, SORT_OPTIONS } from "@/lib/bookmarks";

interface BookmarkToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sort: BookmarkSort;
  onSortChange: (sort: BookmarkSort) => void;
  totalCount: number;
  filteredCount: number;
}

export default function BookmarkToolbar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  totalCount,
  filteredCount,
}: BookmarkToolbarProps) {
  if (totalCount === 0) return null;

  const showMatchCount =
    searchQuery.trim().length > 0 && filteredCount !== totalCount;

  return (
    <div className="panel p-4 shadow-panel space-y-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-faint pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or URL…"
          className="input-field !pl-9 !bg-notion-page/50"
          aria-label="Search bookmarks"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-notion-faint hover:text-notion hover:bg-notion-surface transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-notion-faint mb-2">Sort by</p>
          <div
            role="radiogroup"
            aria-label="Sort bookmarks"
            className="sort-segments"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sort === value}
                aria-pressed={sort === value}
                aria-label={SORT_LABELS[value]}
                title={SORT_LABELS[value]}
                onClick={() => onSortChange(value)}
                className="sort-segment"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {showMatchCount && (
          <p className="text-xs text-notion-muted sm:pb-0.5 sm:text-right shrink-0">
            {filteredCount} of {totalCount} match
          </p>
        )}
      </div>
    </div>
  );
}
