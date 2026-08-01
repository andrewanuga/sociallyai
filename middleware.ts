import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Capture IP
  const ip = req.ip || req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
  
  // Clone headers to pass IP downstream
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-client-ip", ip);
  
  // Pass to the app
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Skip static files, images, etc.
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
