import type { Metadata } from "next";
import Link from "next/link";
import { requireGrantAdmin } from "@/lib/admin-auth";
import { listGrantEmailTemplates } from "@/lib/grant-admin";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { saveGrantEmailTemplateAction } from "../actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grant Email Templates | Filmshow Admin",
  robots: {
    index: false,
    follow: false,
  },
};

const templateLabels = {
  confirmation: "Confirmation",
  accepted: "Accepted / next step",
  not_accepted: "Not accepted",
};

export default async function GrantEmailTemplatesPage() {
  const admin = await requireGrantAdmin();
  const config = getOriginalsServerConfig();
  const templates = await listGrantEmailTemplates(config);

  return (
    <main className="admin-shell">
      <header className="admin-page-header">
        <div>
          <Link href="/admin/grant" className="admin-back-link">
            Back to applications
          </Link>
          <p className="admin-eyebrow">Filmshow Grant</p>
          <h1>Email templates.</h1>
          <p>
            Variables: {"{{first_name}}"}, {"{{full_name}}"},{" "}
            {"{{project_title}}"}, {"{{application_reference}}"},{" "}
            {"{{submission_date}}"}, {"{{payment_confirmation}}"}
          </p>
        </div>
        <p className="admin-signed-in">Signed in as {admin.email}</p>
      </header>

      <section className="admin-template-grid">
        {Object.values(templates).map((template) => (
          <form
            key={template.id}
            action={saveGrantEmailTemplateAction}
            className="admin-card admin-template-form"
          >
            <input type="hidden" name="id" value={template.id} />
            <h2>{templateLabels[template.id]}</h2>
            <label>
              <span>Subject</span>
              <input name="subject" defaultValue={template.subject} required />
            </label>
            <label>
              <span>Body</span>
              <textarea name="body" rows={14} defaultValue={template.body} required />
            </label>
            <button type="submit" className="admin-button">
              Save Template
            </button>
          </form>
        ))}
      </section>
    </main>
  );
}
