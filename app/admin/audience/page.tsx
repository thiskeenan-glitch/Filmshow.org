import type { Metadata } from "next";
import { requireGrantAdmin } from "@/lib/admin-auth";
import { getAudienceAdminSnapshot } from "@/lib/audience-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Filmshow Audience",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function AudienceAdminPage() {
  const admin = await requireGrantAdmin();
  const snapshot = await getAudienceAdminSnapshot().catch(() => null);

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-8 text-stone-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-stone-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              Filmshow Admin
            </p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight sm:text-6xl">
              Audience
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
              The Filmshow-owned master contact list. A contact can belong to the
              Filmshow network without being subscribed to marketing.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-stone-500">
            <span>{admin.email}</span>
            <form action="/admin/grant/logout" method="post">
              <button
                type="submit"
                className="border border-stone-700 px-3 py-2 text-xs uppercase tracking-wider text-stone-300 transition hover:border-stone-500 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {!snapshot ? (
          <div className="border border-red-900/50 bg-red-950/20 p-5 text-sm text-red-200">
            The audience database could not be loaded.
          </div>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-stone-800 bg-stone-900/40 p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">Contacts</p>
                <p className="mt-2 text-4xl font-black">{snapshot.counts.total}</p>
              </div>
              <div className="border border-stone-800 bg-stone-900/40 p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">Subscribed</p>
                <p className="mt-2 text-4xl font-black">{snapshot.counts.subscribed}</p>
              </div>
              <div className="border border-stone-800 bg-stone-900/40 p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">Known, not subscribed</p>
                <p className="mt-2 text-4xl font-black">{snapshot.counts.notSubscribed}</p>
              </div>
              <div className="border border-stone-800 bg-stone-900/40 p-5">
                <p className="text-xs uppercase tracking-wider text-stone-500">Unsubscribed</p>
                <p className="mt-2 text-4xl font-black">{snapshot.counts.unsubscribed}</p>
              </div>
            </section>

            <section className="mt-8 overflow-hidden border border-stone-800">
              <div className="flex flex-col gap-1 border-b border-stone-800 bg-stone-900/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-bold uppercase tracking-wide">Recent contacts</h2>
                <p className="text-xs text-stone-500">
                  Showing up to 250, newest activity first
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead className="bg-black/30 text-[0.68rem] uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Marketing</th>
                      <th className="px-4 py-3 font-medium">Tags</th>
                      <th className="px-4 py-3 font-medium">Consent source</th>
                      <th className="px-4 py-3 font-medium">Email sync</th>
                      <th className="px-4 py-3 font-medium">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {snapshot.contacts.map((contact) => (
                      <tr key={contact.id} className="align-top hover:bg-stone-900/30">
                        <td className="px-4 py-4">
                          <div className="font-medium text-stone-100">
                            {contact.name || "—"}
                          </div>
                          <div className="mt-1 text-xs text-stone-500">{contact.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex border border-stone-700 px-2 py-1 text-[0.68rem] uppercase tracking-wider text-stone-300">
                            {formatStatus(contact.marketing_status)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex max-w-sm flex-wrap gap-1.5">
                            {contact.tags.length ? (
                              contact.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="border border-stone-800 bg-stone-900 px-2 py-1 text-[0.66rem] text-stone-400"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-stone-600">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-400">
                          {contact.marketing_consent_source || "—"}
                        </td>
                        <td className="px-4 py-4 text-xs capitalize text-stone-400">
                          {formatStatus(contact.marketing_sync_status)}
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-400">
                          {formatDate(contact.last_seen_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
