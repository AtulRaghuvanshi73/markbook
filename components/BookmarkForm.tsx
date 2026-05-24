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
      setUrlError("Enter a valid URL");
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
        message: error.message || "Failed to save bookmark.",
      });
    } else if (data) {
      onBookmarkAdded(data as Bookmark);
      setUrl("");
      setTitle("");
      setFeedback({ type: "success", message: "Bookmark saved" });
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="panel p-5 shadow-panel">
      <p className="text-xs font-medium uppercase tracking-wider text-notion-faint mb-4">
        New bookmark
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm text-notion-muted mb-1.5">
            Link
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
            className={`input-field ${urlError ? "!border-red-300 dark:!border-red-800 focus:!ring-red-500/20" : ""}`}
            aria-invalid={!!urlError}
          />
          {urlError && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{urlError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm text-notion-muted mb-1.5"
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
            placeholder="What is this link about?"
            className={`input-field ${titleError ? "!border-red-300 dark:!border-red-800 focus:!ring-red-500/20" : ""}`}
            aria-invalid={!!titleError}
          />
          {titleError && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{titleError}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          {feedback ? (
            <p
              className={`text-xs ${
                feedback.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {feedback.message}
            </p>
          ) : (
            <span />
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Saving…" : "Save bookmark"}
          </button>
        </div>
      </form>
    </div>
  );
}
