import { auth } from "@/auth";

export const middleware = auth((req) => {
  const hasSignedInUser = Boolean(req.auth?.user?.id);

  if (req.nextUrl.pathname === "/") {
    if (hasSignedInUser) {
      const newUrl = new URL("/dashboard", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    return undefined;
  }

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!hasSignedInUser) {
      const newUrl = new URL("/", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
