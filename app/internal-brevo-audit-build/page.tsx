export const dynamic = "force-static";

export default async function InternalBrevoAuditBuildPage() {
  const apiKey = process.env.BREVO_API_KEY?.trim();

  if (!apiKey) {
    console.log("BREVO_LIST_AUDIT", JSON.stringify({ configured: false, lists: [] }));
    return <main>audit unavailable</main>;
  }

  try {
    const response = await fetch(
      "https://api.brevo.com/v3/contacts/lists?limit=50&offset=0&sort=desc",
      {
        headers: { accept: "application/json", "api-key": apiKey },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.log(
        "BREVO_LIST_AUDIT",
        JSON.stringify({ configured: true, upstream_status: response.status, lists: [] }),
      );
      return <main>audit unavailable</main>;
    }

    const payload = (await response.json()) as {
      count?: number;
      lists?: Array<{
        id: number;
        name: string;
        folderId?: number;
        totalSubscribers?: number;
        uniqueSubscribers?: number;
        totalBlacklisted?: number;
      }>;
    };

    const sanitized = {
      configured: true,
      count: payload.count ?? 0,
      lists: (payload.lists ?? []).map((list) => ({
        id: list.id,
        name: list.name,
        folderId: list.folderId ?? null,
        totalSubscribers: list.totalSubscribers ?? null,
        uniqueSubscribers: list.uniqueSubscribers ?? null,
        totalBlacklisted: list.totalBlacklisted ?? null,
      })),
    };

    console.log("BREVO_LIST_AUDIT", JSON.stringify(sanitized));
    return <main>audit complete</main>;
  } catch {
    console.log(
      "BREVO_LIST_AUDIT",
      JSON.stringify({ configured: true, error: "request_failed", lists: [] }),
    );
    return <main>audit unavailable</main>;
  }
}
