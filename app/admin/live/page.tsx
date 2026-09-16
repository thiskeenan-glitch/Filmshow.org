import type { Metadata } from "next";
import { requireGrantAdmin } from "@/lib/admin-auth";
import { getLiveAdminSnapshot } from "@/lib/live/data";
import { LiveControlPanel } from "./live-control-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Filmshow Live Control",
  robots: { index: false, follow: false },
};

export default async function LiveAdminPage() {
  const admin = await requireGrantAdmin();
  const snapshot = await getLiveAdminSnapshot().catch(() => null);

  return (
    <main className="admin-shell live-admin-shell">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Filmshow Live</p>
          <h1>Show control.</h1>
          <p>Signed in as {admin.email}</p>
        </div>
        <form action="/admin/grant/logout" method="post">
          <button type="submit" className="admin-button admin-button--secondary">Sign Out</button>
        </form>
      </header>

      {snapshot ? (
        <LiveControlPanel snapshot={snapshot} />
      ) : (
        <div className="admin-warning">
          Filmshow Live has not been configured in Supabase yet. Apply the Live migration before using show control.
        </div>
      )}
    </main>
  );
}
