import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/components/LoginPage";
import { redirect } from "next/navigation";

type HomeProps = {
  searchParams: Promise<{ code?: string; next?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  if (params.code) {
    const query = new URLSearchParams({ code: params.code });
    if (params.next) query.set("next", params.next);
    redirect(`/auth/callback?${query.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
