import {
  LIVE_EVENT_DATE_LABEL,
  LIVE_EVENT_START,
  LIVE_EVENT_SUBTITLE,
  LIVE_EVENT_TITLE,
  getLiveCheckoutStatus,
  getLiveConfigStatus,
  getLiveStreamConfig,
  isFilmshowLiveEnabled,
} from "@/lib/live/config";
import { connectLiveAudienceUser, getLiveViewerSnapshot } from "@/lib/live/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LiveAuthForm } from "./live-auth-form";
import { LiveCheckoutButton } from "./live-checkout-button";
import { LiveCountdown } from "./live-countdown";
import { LiveViewer } from "./live-viewer";
import { signOutLive } from "./actions";
import { createPageMetadata, routeMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(routeMetadata.live);

function LiveIntroduction({ startsAt }: { startsAt: string }) {
  return (
    <>
      <div className="live-title-block">
        <p className="live-eyebrow">Filmshow Live</p>
        <h1>{LIVE_EVENT_TITLE}</h1>
        <p className="live-subtitle">{LIVE_EVENT_SUBTITLE}</p>
        <p className="live-date">{LIVE_EVENT_DATE_LABEL}</p>
      </div>
      <LiveCountdown startsAt={startsAt} />
      <p className="live-lede">
        Watch Filmshow live from Brooklyn. See the films. See the live
        performance. Cast one marble. Help choose the $1,000 audience-prize
        winner.
      </p>
    </>
  );
}

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; checkout?: string }>;
}) {
  const enabled = isFilmshowLiveEnabled();
  const configStatus = getLiveConfigStatus();
  const checkoutStatus = getLiveCheckoutStatus();
  const params = await searchParams;

  let user = null;
  if (configStatus.ready) {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  }

  let snapshot = null;
  if (configStatus.ready) {
    if (user) await connectLiveAudienceUser(user).catch(() => {});
    snapshot = await getLiveViewerSnapshot(user).catch(() => null);
  }

  const startsAt = snapshot?.event.starts_at || LIVE_EVENT_START;
  const canSellTickets = Boolean(
    enabled &&
      configStatus.ready &&
      checkoutStatus.ready &&
      snapshot?.event.is_enabled &&
      snapshot.event.ticket_sales_enabled,
  );

  return (
    <main className="live-page">
      <section className="live-shell">
        {user && snapshot?.entitlement ? (
          <>
            <header className="live-room-header">
              <div>
                <p className="live-eyebrow">Filmshow Live</p>
                <h1>{snapshot.event.title}</h1>
              </div>
              <form action={signOutLive}>
                <button type="submit" className="live-text-button">Sign out</button>
              </form>
            </header>
            <LiveViewer
              event={snapshot.event}
              initialState={snapshot.state}
              program={snapshot.program}
              initialVote={snapshot.vote}
              stream={getLiveStreamConfig()}
            />
          </>
        ) : (
          <div className="live-landing">
            <LiveIntroduction startsAt={startsAt} />

            {!enabled ? (
              <div className="live-disabled-note">
                <strong>Broadcast plans are still being finalized.</strong>
                <span>Filmshow Live is not currently on sale.</span>
              </div>
            ) : !configStatus.ready || !snapshot ? (
              <div className="live-disabled-note">
                <strong>Filmshow Live is being prepared.</strong>
                <span>Please check back soon.</span>
              </div>
            ) : !user ? (
              <>
                {params.auth === "invalid" ? (
                  <p className="live-form-message is-error" role="alert">
                    That sign-in link is invalid or expired. Request a new one.
                  </p>
                ) : null}
                <LiveAuthForm />
              </>
            ) : canSellTickets ? (
              <>
                {params.checkout === "success" ? (
                  <p className="live-form-message" role="status">
                    Payment received. Access appears as soon as Stripe confirms it.
                  </p>
                ) : null}
                <LiveCheckoutButton />
                <form action={signOutLive}>
                  <button type="submit" className="live-text-button">
                    Sign out of {user.email}
                  </button>
                </form>
              </>
            ) : (
              <div className="live-disabled-note">
                <strong>Tickets are not on sale yet.</strong>
                <span>You are signed in as {user.email}.</span>
                <form action={signOutLive}>
                  <button type="submit" className="live-text-button">Sign out</button>
                </form>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
