"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setBookmarks(data);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to realtime changes
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

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleBookmarkAdded = (newBookmark: Bookmark) => {
    // Optimistically add — realtime will also trigger but deduplicate is handled via id check
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
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookmarks</h1>
        <p className="text-slate-500 text-sm mt-1">
          {bookmarks.length === 0
            ? "Start saving your favorite links"
            : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""} saved`}
        </p>
      </div>

      {/* Add bookmark form */}
      <BookmarkForm onBookmarkAdded={handleBookmarkAdded} />

      {/* Bookmark list */}
      <BookmarkList
        bookmarks={bookmarks}
        isLoading={isLoading}
        onBookmarkDeleted={handleBookmarkDeleted}
      />
    </div>
  );
}
