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
  const originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  supabase.auth.getUser = async (jwt?: string) => {
    const res = await originalGetUser(jwt);
    if (!res.data.user) return res;
    
    const impersonateId = cookieStore.get("sai-admin-impersonate")?.value;
    if (impersonateId) {
      // Check if real user is admin
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", res.data.user.id).single();
      if (profile?.is_admin) {
        // Return a mocked user object with the target ID.
        // The admin RLS policies in the DB allow this user to access the target's data.
        return {
          data: {
            user: { ...res.data.user, id: impersonateId }
          },
          error: null
        } as any;
      }
    }
    return res;
  };

  return supabase;
}
