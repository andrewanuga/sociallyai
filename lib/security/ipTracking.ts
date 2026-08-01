import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-client-ip") || headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
}
