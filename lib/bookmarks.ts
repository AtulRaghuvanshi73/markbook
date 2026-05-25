export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
}

export type BookmarkSort = "newest" | "oldest" | "title-az";

/** Normalize URLs so http/https and trailing slashes still match as duplicates. */
export function normalizeBookmarkUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    const pathname = parsed.pathname.replace(/\/$/, "") || "";
    return `${host}${pathname}${parsed.search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

export function isDuplicateUrl(url: string, bookmarks: Bookmark[]): boolean {
  const normalized = normalizeBookmarkUrl(url);
  return bookmarks.some((b) => normalizeBookmarkUrl(b.url) === normalized);
}

export function filterBookmarks(
  bookmarks: Bookmark[],
  query: string
): Bookmark[] {
  const q = query.trim().toLowerCase();
  if (!q) return bookmarks;

  return bookmarks.filter((b) => {
    const title = b.title.toLowerCase();
    const url = b.url.toLowerCase();
    return title.includes(q) || url.includes(q);
  });
}

export function sortBookmarks(
  bookmarks: Bookmark[],
  sort: BookmarkSort
): Bookmark[] {
  const copy = [...bookmarks];

  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case "title-az":
      return copy.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export const SORT_LABELS: Record<BookmarkSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "title-az": "Title A–Z",
};
