import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

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

export default function AuthCodeError() {
  return (
    <div className="relative min-h-screen page-dots flex flex-col">
      <header className="sticky top-0 z-10 border-b border-notion bg-notion-page/70 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-notion flex items-center justify-center dark:bg-stone-200">
              <BookmarkIcon className="w-3.5 h-3.5 text-notion-page" />
            </div>
            <span className="text-sm font-medium text-notion tracking-tight">
              markbook
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="panel max-w-sm p-8 shadow-panel text-center w-full">
          <h1 className="text-xl font-semibold text-notion tracking-tight">
            Authentication error
          </h1>
          <p className="mt-2 text-[15px] text-notion-muted">
            Something went wrong during sign in. Please try again.
          </p>
          <Link href="/" className="btn-primary mt-6 w-full inline-flex">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
