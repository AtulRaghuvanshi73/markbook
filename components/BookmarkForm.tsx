"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Bookmark } from "./BookmarkDashboard";

interface BookmarkFormProps {
  onBookmarkAdded: (bookmark: Bookmark) => void;
}

type FeedbackState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BookmarkForm({ onBookmarkAdded }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const validate = () => {
    let valid = true;

    if (!url.trim()) {
      setUrlError("URL is required");
      valid = false;
    } else if (!isValidUrl(url.trim())) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      valid = false;
    } else {
      setUrlError(null);
    }

    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else if (title.trim().length > 200) {
      setTitleError("Title must be under 200 characters");
      valid = false;
    } else {
      setTitleError(null);
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFeedback({ type: "error", message: "You must be logged in." });
      setIsSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        url: url.trim(),
        title: title.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to save bookmark. Please try again.",
      });
    } else if (data) {
      onBookmarkAdded(data as Bookmark);
      setUrl("");
      setTitle("");
      setFeedback({ type: "success", message: "Bookmark saved successfully!" });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-brand-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add New Bookmark
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* URL input */}
        <div>
          <label
            htmlFor="url"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            placeholder="https://example.com"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 placeholder-slate-400 text-slate-800 ${
              urlError
                ? "border-red-300 focus:ring-red-300/30"
                : "border-slate-200 focus:border-brand-400"
            }`}
          />
          {urlError && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {urlError}
            </p>
          )}
        </div>

        {/* Title input */}
        <div>
          <label
            htmlFor="title"
            className="block text-xs font-medium text-slate-600 mb-1.5"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError(null);
            }}
            placeholder="Enter a descriptive title"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 placeholder-slate-400 text-slate-800 ${
              titleError
                ? "border-red-300 focus:ring-red-300/30"
                : "border-slate-200 focus:border-brand-400"
            }`}
          />
          {titleError && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {titleError}
            </p>
          )}
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}
          >
            {feedback.type === "success" ? (
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              Save Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  );
}
