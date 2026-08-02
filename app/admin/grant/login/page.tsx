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

export default function GrantAdminLoginPage() {
  const authStatus = getAdminAuthStatus();

  return (
    <main className="admin-shell">
      <section className="admin-login-panel">
        <p className="admin-eyebrow">Filmshow Grant</p>
        <h1>Admin sign in.</h1>
        <p>
          This private area is only for approved Filmshow Grant reviewers.
        </p>
        {!authStatus.ready ? (
          <div className="admin-warning">
            Missing admin setup: {authStatus.missing.join(", ")}.
          </div>
        ) : null}
        <GrantLoginForm />
      </section>
    </main>
  );
}
