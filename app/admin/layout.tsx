import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = { title: "Admin — Socially AI" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="sai-app min-h-screen" style={{ background: "var(--app-bg)" }}>
      <AdminNav />
      <div className="min-h-screen pl-[240px]">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
