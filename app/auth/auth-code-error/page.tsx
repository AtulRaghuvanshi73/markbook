import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen page-dots flex items-center justify-center px-5">
      <div className="panel max-w-sm p-8 shadow-panel text-center">
        <h1 className="text-xl font-semibold text-notion tracking-tight">
          Authentication error
        </h1>
        <p className="mt-2 text-[15px] text-notion-muted">
          Something went wrong during sign in. Please try again.
        </p>
        <Link href="/" className="btn-primary mt-6 w-full">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
