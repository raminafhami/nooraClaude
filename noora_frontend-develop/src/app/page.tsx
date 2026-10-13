import { redirect, RedirectType } from "next/navigation";

// Without this, `next build` statically prerenders the redirect into a
// broken cached response (no Location header) instead of redirecting
// per-request.
export const dynamic = "force-dynamic";

function RootPage() {
  redirect("/login", RedirectType.replace);
}

export default RootPage;
