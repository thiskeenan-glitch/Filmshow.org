import type { Metadata } from "next";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { GrantLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Filmshow Grant Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GrantAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const authStatus = getAdminAuthStatus();
  const params = await searchParams;
  const next = params.next === "/admin/live" ? "/admin/live" : "/admin/grant";
  const isLiveAdmin = next === "/admin/live";

  return (
    <main className="admin-shell">
      <section className="admin-login-panel">
        <p className="admin-eyebrow">
          {isLiveAdmin ? "Filmshow Live" : "Filmshow Grant"}
        </p>
        <h1>Admin sign in.</h1>
        <p>
          This private area is only for approved Filmshow administrators.
        </p>
        {!authStatus.ready ? (
          <div className="admin-warning">
            Missing admin setup: {authStatus.missing.join(", ")}.
          </div>
        ) : null}
        <GrantLoginForm next={next} />
      </section>
    </main>
  );
}
