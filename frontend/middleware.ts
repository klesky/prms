export { default } from "next-auth/middleware";

// Protect every route except NextAuth's own endpoints, Next internals, and static assets.
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
