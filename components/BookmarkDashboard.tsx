"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import BookmarkForm from "./BookmarkForm";
import BookmarkList from "./BookmarkList";

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
}

interface BookmarkDashboardProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

export default function BookmarkDashboard({
  initialBookmarks,
  userId,
}: BookmarkDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

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

      <BookmarkForm onBookmarkAdded={handleBookmarkAdded} />

      <BookmarkList
        bookmarks={bookmarks}
        onBookmarkDeleted={handleBookmarkDeleted}
      />
    </div>
  );
}
