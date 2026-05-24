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

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-notion-page">
      <Header user={user} />
      <main className="max-w-xl mx-auto px-5 py-8 sm:py-10">
        <BookmarkDashboard
          initialBookmarks={bookmarks ?? []}
          userId={user.id}
        />
      </main>
    </div>
  );
}
