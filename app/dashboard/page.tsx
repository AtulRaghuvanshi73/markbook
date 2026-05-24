import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import BookmarkDashboard from "@/components/BookmarkDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Fetch initial bookmarks server-side
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BookmarkDashboard
          initialBookmarks={bookmarks ?? []}
          userId={user.id}
        />
      </main>
    </div>
  );
}
