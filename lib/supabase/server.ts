import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  // Impersonation logic
  let checkingImpersonation = false;
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  
  supabase.auth.getUser = async (jwt?: string) => {
    const res = await originalGetUser(jwt);
    if (!res.data.user || checkingImpersonation) return res;
    
    const impersonateId = cookieStore.get("sai-admin-impersonate")?.value;
    if (impersonateId) {
      checkingImpersonation = true;
      try {
        // Use a direct fetch or admin client to avoid any recursive hooks
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", res.data.user.id).single();
        if (profile?.is_admin) {
          return {
            data: {
              user: { ...res.data.user, id: impersonateId }
            },
            error: null
          } as any;
        }
      } finally {
        checkingImpersonation = false;
      }
    }
    return res;
  };

  return supabase;
}
