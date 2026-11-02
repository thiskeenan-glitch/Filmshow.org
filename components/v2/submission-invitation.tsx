"use client";

import { useEffect, useRef } from "react";
import { filmshowV2Config } from "@/lib/filmshow-v2-config";
import "./submission-invitation.css";

const SEEN_KEY = "filmshow-v2-submission-invitation-v1";

export function SubmissionInvitation() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    try {
      if (localStorage.getItem(SEEN_KEY) || sessionStorage.getItem(SEEN_KEY)) return;
    } catch { /* Still show the invitation if browser storage is unavailable. */ }

    const timer = window.setTimeout(() => {
      dialog.showModal();
      try { localStorage.setItem(SEEN_KEY, "seen"); } catch { /* Private browser settings. */ }
      try { sessionStorage.setItem(SEEN_KEY, "seen"); } catch { /* Storage is optional. */ }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      dialog.close();
    };
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="submission-invitation"
      aria-labelledby="submission-invitation-title"
      aria-describedby="submission-invitation-description"
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div className="submission-invitation__content">
        <button type="button" className="submission-invitation__close" aria-label="Close submission invitation" onClick={close}>×</button>
        <p className="v2-kicker">Filmshow Volume 2 / Brooklyn</p>
        <h2 id="submission-invitation-title">Submissions<br />are now open.</h2>
        <p id="submission-invitation-description">Your short film. A live audience. A show like no other. Submit your film for the next Filmshow.</p>
        <a className="submission-invitation__submit" href={filmshowV2Config.submissions.href} target="_blank" rel="noopener noreferrer" onClick={close}>Submit your film ↗</a>
        <button type="button" className="submission-invitation__later" onClick={close}>Keep exploring</button>
      </div>
    </dialog>
  );
}
