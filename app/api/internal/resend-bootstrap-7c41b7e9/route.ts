import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RESEND_API = "https://api.resend.com";
const SEGMENT_NAME = "Filmshow Newsletter";

async function resendFetch(path: string, apiKey: string, init?: RequestInit) {
  return fetch(`${RESEND_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, configured: false, error: "RESEND_API_KEY missing" },
      { status: 503 },
    );
  }

  try {
    const segmentsResponse = await resendFetch("/segments", apiKey);
    const segmentsPayload = (await segmentsResponse.json()) as {
      data?: Array<{ id: string; name: string }>;
      message?: string;
    };

    if (!segmentsResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          apiAuthenticated: false,
          status: segmentsResponse.status,
          error: segmentsPayload.message || "Resend segment listing failed",
        },
        { status: 502 },
      );
    }

    let segment = segmentsPayload.data?.find(
      (entry) => entry.name.toLowerCase() === SEGMENT_NAME.toLowerCase(),
    );
    let segmentCreated = false;

    if (!segment) {
      const createSegmentResponse = await resendFetch("/segments", apiKey, {
        method: "POST",
        body: JSON.stringify({ name: SEGMENT_NAME }),
      });
      const createSegmentPayload = (await createSegmentResponse.json()) as {
        id?: string;
        name?: string;
        message?: string;
      };
      if (!createSegmentResponse.ok || !createSegmentPayload.id) {
        return NextResponse.json(
          {
            ok: false,
            configured: true,
            apiAuthenticated: true,
            status: createSegmentResponse.status,
            error: createSegmentPayload.message || "Resend segment creation failed",
          },
          { status: 502 },
        );
      }
      segment = {
        id: createSegmentPayload.id,
        name: createSegmentPayload.name || SEGMENT_NAME,
      };
      segmentCreated = true;
    }

    const testEmail = `filmshow-resend-healthcheck-${Date.now()}@example.com`;
    const createContactResponse = await resendFetch("/contacts", apiKey, {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        unsubscribed: false,
        segments: [{ id: segment.id }],
        properties: { source: "filmshow_resend_healthcheck" },
      }),
    });
    const createContactPayload = (await createContactResponse.json()) as {
      id?: string;
      message?: string;
    };

    let contactTest = "create_failed";
    if (createContactResponse.ok) {
      contactTest = "created";
      const deleteContactResponse = await resendFetch(
        `/contacts/${encodeURIComponent(testEmail)}`,
        apiKey,
        { method: "DELETE" },
      );
      contactTest = deleteContactResponse.ok ? "created_and_deleted" : "created_cleanup_failed";
    }

    const domainsResponse = await resendFetch("/domains", apiKey);
    const domainsPayload = domainsResponse.ok
      ? ((await domainsResponse.json()) as {
          data?: Array<{ id: string; name: string; status: string }>;
        })
      : { data: [] };

    return NextResponse.json({
      ok: createContactResponse.ok,
      configured: true,
      apiAuthenticated: true,
      segment: {
        id: segment.id,
        name: segment.name,
        created: segmentCreated,
      },
      contactTest,
      contactStatus: createContactResponse.status,
      contactError: createContactResponse.ok
        ? null
        : createContactPayload.message || "Resend contact test failed",
      domains: (domainsPayload.data || []).map((domain) => ({
        name: domain.name,
        status: domain.status,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
