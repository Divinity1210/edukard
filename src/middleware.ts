import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes.
  // NOTE: provider webhooks (/api/webhooks/*) must never be auth-gated — they
  // arrive without a user session and perform their own HMAC/signature
  // verification inside each route handler. Gating them would redirect Stripe,
  // Plaid, Circle and Sumsub to /login and silently drop every event.
  const publicRoutes = ["/", "/login", "/signup", "/verify-email", "/about", "/privacy", "/terms"];
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks");

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "student";

  // Role-based route protection mapping
  const routeProtections: { [key: string]: string[] } = {
    "/admin": ["admin"],
    "/investor": ["investor", "admin"],
    "/university": ["university", "admin"],
    "/agent": ["agent", "admin"],
    "/student": ["student", "admin"],
  };

  // Check if current path matches any protected route prefix
  for (const [routePrefix, allowedRoles] of Object.entries(routeProtections)) {
    if (pathname.startsWith(routePrefix)) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Redirect /dashboard to the correct portal
  if (pathname === "/dashboard") {
    const dashboardMap: Record<string, string> = {
      student: "/student/dashboard",
      investor: "/investor/dashboard",
      admin: "/admin/dashboard",
      university: "/university/dashboard",
      agent: "/agent/dashboard",
    };
    return NextResponse.redirect(new URL(dashboardMap[role] || "/student/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
