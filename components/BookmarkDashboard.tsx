"use client";

import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  filterBookmarks,
  sortBookmarks,
  type Bookmark,
  type BookmarkSort,
} from "@/lib/bookmarks";
import BookmarkForm from "./BookmarkForm";
import BookmarkList from "./BookmarkList";
import BookmarkToolbar from "./BookmarkToolbar";

export type { Bookmark };

interface BookmarkDashboardProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

export default function BookmarkDashboard({
  initialBookmarks,
  userId,
}: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<BookmarkSort>("newest");

  const displayedBookmarks = useMemo(() => {
    const filtered = filterBookmarks(bookmarks, searchQuery);
    return sortBookmarks(filtered, sort);
  }, [bookmarks, searchQuery, sort]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("bookmarks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new as Bookmark, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === (payload.new as Bookmark).id
                  ? (payload.new as Bookmark)
                  : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleBookmarkAdded = (newBookmark: Bookmark) => {
    setBookmarks((prev) => {
      if (prev.some((b) => b.id === newBookmark.id)) return prev;
      return [newBookmark, ...prev];
    });
  };

  const handleBookmarkDeleted = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-notion tracking-tight">
          Bookmarks
        </h1>
        <p className="text-notion-muted text-sm mt-1">
          {bookmarks.length === 0
            ? "Add your first link below"
            : `${bookmarks.length} saved`}
        </p>
      </div>

      <BookmarkForm
        onBookmarkAdded={handleBookmarkAdded}
        existingBookmarks={bookmarks}
      />

      <BookmarkToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sort={sort}
        onSortChange={setSort}
        totalCount={bookmarks.length}
        filteredCount={displayedBookmarks.length}
      />

      <BookmarkList
        bookmarks={displayedBookmarks}
        totalCount={bookmarks.length}
        searchQuery={searchQuery}
        onBookmarkDeleted={handleBookmarkDeleted}
      />
    </div>
  );
}
