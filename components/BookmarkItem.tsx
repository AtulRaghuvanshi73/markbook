"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "./BookmarkDashboard";

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDeleted: (id: string) => void;
}

function getFaviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=example.com&sz=32`;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export default function BookmarkItem({ bookmark, onDeleted }: BookmarkItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", bookmark.id);

    if (!error) {
      onDeleted(bookmark.id);
    } else {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const faviconUrl = getFaviconUrl(bookmark.url);
  const hostname = getHostname(bookmark.url);

  if (showConfirm) {
    return (
      <div className="panel px-4 py-3 !border-red-200 dark:!border-red-900/50 bg-red-50/50 dark:bg-red-950/30">
        <p className="text-sm text-notion truncate">
          Delete &ldquo;{bookmark.title}&rdquo;?
        </p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="text-xs font-medium text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
            className="btn-ghost text-xs !px-3 !py-1.5"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group panel px-3 py-3 hover:shadow-panel transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-notion-surface border border-notion flex items-center justify-center flex-shrink-0">
          {!faviconError ? (
            <img
              src={faviconUrl}
              alt=""
              width={18}
              height={18}
              onError={() => setFaviconError(true)}
              className="w-[18px] h-[18px] object-contain"
            />
          ) : (
            <span className="w-4 h-4 rounded bg-notion-surface" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-medium text-notion truncate hover:text-accent transition-colors"
          >
            {bookmark.title}
          </a>
          <p className="text-xs text-notion-faint truncate mt-0.5">
            {hostname} · {formatDate(bookmark.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-notion-faint hover:text-notion hover:bg-notion-surface transition-colors"
            title="Open"
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-md text-notion-faint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
