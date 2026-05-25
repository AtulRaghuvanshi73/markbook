"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  user: User;
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

export default function Header({ user }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";
  const avatarInitial = (displayName.trim().charAt(0) || "U").toUpperCase();
  const validAvatarUrl =
    typeof avatarUrl === "string" && avatarUrl.trim().length > 0
      ? avatarUrl
      : null;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [validAvatarUrl]);

  return (
    <header className="sticky top-0 z-10 border-b border-notion bg-notion-page/70 backdrop-blur-md">
      <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-notion flex items-center justify-center shrink-0 dark:bg-stone-200">
              <BookmarkIcon className="w-3.5 h-3.5 text-notion-page" />
            </div>
            <span className="text-sm font-medium text-notion tracking-tight truncate">
              markbook
            </span>
          </div>

          <div className="h-4 w-px bg-notion shrink-0" aria-hidden />

          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-notion bg-notion-surface/50">
            {validAvatarUrl && !avatarLoadFailed ? (
              <img
                src={validAvatarUrl}
                alt={displayName}
                className="w-5 h-5 rounded-full"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-notion-surface flex items-center justify-center">
                <span className="text-[10px] font-medium text-notion-muted">
                  {avatarInitial}
                </span>
              </div>
            )}
            <span className="text-sm text-notion-muted max-w-[120px] truncate">
              {displayName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="btn-ghost text-sm"
          >
            {isLoggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
