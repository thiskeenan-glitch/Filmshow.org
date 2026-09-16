"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const milliseconds = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(milliseconds / 86_400_000),
    hours: Math.floor((milliseconds / 3_600_000) % 24),
    minutes: Math.floor((milliseconds / 60_000) % 60),
    seconds: Math.floor((milliseconds / 1000) % 60),
  };
}

export function LiveCountdown({ startsAt }: { startsAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(startsAt));

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining(startsAt)), 1000);
    return () => window.clearInterval(timer);
  }, [startsAt]);

  return (
    <div className="live-countdown" aria-label="Countdown to Filmshow Live">
      {Object.entries(remaining).map(([label, value]) => (
        <div key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
