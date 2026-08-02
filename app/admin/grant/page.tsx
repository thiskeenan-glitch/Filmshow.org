import type { Metadata } from "next";
import { requireGrantAdmin } from "@/lib/admin-auth";
import {
  listGrantEmailTemplates,
  listGrantSubmissions,
} from "@/lib/grant-admin";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { GrantDashboardClient } from "./grant-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Filmshow Grant Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GrantAdminPage() {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const [submissions, templates] = await Promise.all([
    listGrantSubmissions(config),
    listGrantEmailTemplates(config),
  ]);

  return (
    <main className="admin-shell">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Filmshow Grant</p>
          <h1>Applications.</h1>
          <p>Signed in as {admin.email}</p>
        </div>
        <form action="/admin/grant/logout" method="post">
          <button type="submit" className="admin-button admin-button--secondary">
            Sign Out
          </button>
        </form>
      </header>
      <GrantDashboardClient submissions={submissions} templates={templates} />
    </main>
  );
}
