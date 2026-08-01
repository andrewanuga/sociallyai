import { cookies } from "next/headers";
import { ImpersonationBannerClient } from "./ImpersonationBannerClient";

export async function ImpersonationBanner() {
  const cookieStore = await cookies();
  const targetId = cookieStore.get("sai-admin-impersonate")?.value;
  
  if (!targetId) return null;
  
  return <ImpersonationBannerClient targetId={targetId} />;
}
