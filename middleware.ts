import { auth } from "@/auth";

export const middleware = auth((req) => {
  if (req.nextUrl.pathname === "/") {
    if (req.auth) {
      const newUrl = new URL("/dashboard", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    return undefined;
  }

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      const newUrl = new URL("/", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
