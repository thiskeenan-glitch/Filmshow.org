export const filmshowV2Config = {
  tickets: {
    status: "unannounced" as const,
    label: "Next date coming soon",
    href: "/tickets",
  },
  submissions: {
    status: "check-current-page" as const,
    label: "Submission details",
    href: "https://filmfreeway.com/TheFilmShow",
  },
  editions: [
    {
      slug: "v1",
      label: "Volume 1",
      date: "October 3, 2026",
      location: "Brooklyn, New York",
      status: "archive-in-progress" as const,
    },
  ],
} as const;
