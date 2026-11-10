import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filmshow Loop | Find more great films",
  description: "A managed filmmaker discovery and outreach service for independent film festivals. Apply for one of five founding festival spots.",
  robots: { index: false, follow: false },
};

const steps = [
  ["01", "Tell us what fits", "Share your festival, deadlines, film categories, runtime, and submission rules."],
  ["02", "We discover filmmakers", "The Loop researches eligible films and verifies appropriate outreach contacts."],
  ["03", "The invitations go out", "Targeted, festival-voiced invitations are sent within an approved daily limit."],
  ["04", "See what works", "Review invitations, replies, opt-outs, and trackable submissions in weekly reports."],
];

const features = [
  "Qualified filmmaker discovery and deduplication",
  "Up to 400 targeted invitations per active month",
  "Festival-specific copy, links, and discount policy",
  "Human review of sensitive replies",
  "Suppression list and sender compliance safeguards",
  "Weekly delivery and conversion reporting",
];

const mailto = "mailto:keenan@filmshow.org?subject=Filmshow%20Loop%20founding%20festival&body=Festival%20name%3A%0AFestival%20website%3A%0ASubmission%20deadline%3A%0AWhat%20kinds%20of%20films%20are%20you%20looking%20for%3F%0A";

export default function LoopPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0b0a0e", color: "#f6f4f8", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: 1.55 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 100px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, borderBottom: "1px solid #303038", paddingBottom: 26 }}>
          <a href="/loop" style={{ color: "#fff", textDecoration: "none", letterSpacing: "-.06em", fontWeight: 800, fontSize: 25 }}>FILMSHOW <span style={{ color: "#a89afc" }}>LOOP</span></a>
          <a href="#apply" style={{ color: "#f1ebff", border: "1px solid #5f527c", borderRadius: 100, padding: "10px 18px", textDecoration: "none", fontSize: 14 }}>Founding festival access</a>
        </header>
        <section style={{ padding: "104px 0 90px", maxWidth: 870 }}>
          <p style={{ color: "#aa9dfb", fontSize: 12, letterSpacing: ".19em", fontWeight: 700, textTransform: "uppercase" }}>More films. Less searching.</p>
          <h1 style={{ fontSize: "clamp(46px, 8vw, 102px)", letterSpacing: "-.075em", lineHeight: 1.03, margin: "24px 0" }}>Great films don&apos;t always find you.<br /><span style={{ color: "#afa1ff" }}>We find them.</span></h1>
          <p style={{ maxWidth: 600, color: "#bdb8c8", fontSize: 20, lineHeight: 1.6 }}>Filmshow Loop is a managed outreach engine for film festivals. We find relevant independent films, invite the right filmmakers to submit, and report what actually happens.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 35 }}>
            <a href="#apply" style={{ padding: "15px 25px", borderRadius: 100, color: "#130f24", background: "#b3a6ff", textDecoration: "none", fontWeight: 700 }}>Apply for founding access →</a>
            <a href="#how" style={{ padding: "15px 25px", borderRadius: 100, color: "#fff", border: "1px solid #413b4f", textDecoration: "none" }}>How it works</a>
          </div>
        </section>
        <section id="how" style={{ borderTop: "1px solid #303038", padding: "65px 0" }}>
          <p style={{ color: "#a89afc", textTransform: "uppercase", fontSize: 12, letterSpacing: ".16em" }}>The process</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", letterSpacing: "-.05em", margin: "8px 0 35px" }}>Your submission pipeline, handled.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {steps.map(([number, title, detail]) => <article key={number} style={{ background: "#18161e", border: "1px solid #2b2933", borderRadius: 18, padding: 23 }}><div style={{ color: "#a89afc", marginBottom: 28, fontWeight: 700 }}>{number}</div><h3 style={{ fontSize: 19, letterSpacing: "-.025em" }}>{title}</h3><p style={{ color: "#aca7b8", fontSize: 14 }}>{detail}</p></article>)}
          </div>
        </section>
        <section style={{ borderTop: "1px solid #303038", padding: "65px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 40 }}>
          <div><p style={{ color: "#a89afc", textTransform: "uppercase", fontSize: 12, letterSpacing: ".16em" }}>Built by a festival director</p><h2 style={{ fontSize: 43, lineHeight: 1.1, letterSpacing: "-.055em" }}>More time choosing films. Less time hunting for them.</h2><p style={{ color: "#aaa5b3" }}>We built this workflow to help Filmshow find filmmakers. We&apos;re now inviting a small group of festival operators to help shape the managed service.</p></div>
          <div style={{ display: "grid", gap: 12, alignContent: "center" }}>{features.map(feature => <div key={feature} style={{ display: "flex", gap: 12, alignItems: "baseline", color: "#ddd9e5" }}><span style={{ color: "#aa9dfb" }}>✓</span>{feature}</div>)}</div>
        </section>
        <section id="apply" style={{ background: "#211c2d", border: "1px solid #584b77", borderRadius: 25, padding: "clamp(28px, 6vw, 58px)", marginTop: 30 }}>
          <p style={{ color: "#beafff", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase" }}>Five founding festival spots</p>
          <h2 style={{ fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: "-.055em", margin: "14px 0" }}>$149 <span style={{ fontSize: 19, color: "#c9c0d5", letterSpacing: 0 }}>/ active month</span></h2>
          <p style={{ color: "#d3ccdd", maxWidth: 610 }}>Month-to-month founding rate. Setup is handled with you. Invitations only begin after your sender, festival criteria, suppression rules, and final copy are approved.</p>
          <a href={mailto} style={{ display: "inline-block", marginTop: 22, padding: "16px 24px", background: "#b3a6ff", color: "#160f2d", borderRadius: 100, fontWeight: 800, textDecoration: "none" }}>Apply by email →</a>
          <p style={{ color: "#aaa2ba", fontSize: 12, marginTop: 22 }}>Founding access is currently reviewed manually. Submission volume and revenue are not guaranteed. This page does not charge you or connect to your inbox.</p>
        </section>
        <footer style={{ borderTop: "1px solid #303038", marginTop: 85, paddingTop: 25, color: "#77717f", fontSize: 12 }}>© 2026 Filmshow Loop. For festival operators. <a href="mailto:keenan@filmshow.org" style={{ color: "#aaa0d9" }}>Contact</a></footer>
      </div>
    </main>
  );
}
