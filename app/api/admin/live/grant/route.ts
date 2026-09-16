import { getGrantAdminUser } from "@/lib/admin-auth";
import { LIVE_EVENT_SLUG } from "@/lib/live/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = await getGrantAdminUser();
  if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() || "";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: event } = await supabase
    .from("live_events")
    .select("id")
    .eq("slug", LIVE_EVENT_SLUG)
    .maybeSingle();
  if (!event) return NextResponse.json({ message: "Live event not found." }, { status: 404 });

  const { data: contactId, error: contactError } = await supabase.rpc(
    "upsert_audience_contact",
    { p_email: email, p_name: null, p_marketing_opt_in: false, p_consent_source: null },
  );
  if (contactError) return NextResponse.json({ message: "Audience record could not be saved." }, { status: 500 });

  const { data: contact } = await supabase
    .from("audience_contacts")
    .select("auth_user_id")
    .eq("id", contactId)
    .maybeSingle();

  const { error } = await supabase.from("live_entitlements").upsert(
    {
      event_id: event.id,
      user_id: contact?.auth_user_id || null,
      email_normalized: email,
      source: "comp",
      status: "active",
      granted_by: admin.id,
      granted_at: new Date().toISOString(),
      revoked_at: null,
      metadata: { granted_by_email: admin.email },
    },
    { onConflict: "event_id,email_normalized" },
  );
  if (error) return NextResponse.json({ message: "Complimentary access could not be granted." }, { status: 500 });

  if (contactId) {
    await supabase.from("audience_events").upsert(
      {
        contact_id: contactId,
        event_type: "filmshow_live_comp_granted",
        source: "admin",
        source_record_id: event.id,
        campaign: LIVE_EVENT_SLUG,
        dedupe_key: `filmshow-live-comp:${event.id}:${email}`,
        metadata: { granted_by: admin.email },
      },
      { onConflict: "dedupe_key", ignoreDuplicates: true },
    );
  }

  return NextResponse.json({ granted: true });
}
