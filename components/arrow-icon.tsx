type ArrowDirection = "up-right" | "right" | "left" | "down";

const paths: Record<ArrowDirection, string> = {
  "up-right": "M5 19 19 5M5 5h14v14",
  right: "M3 12h18m-8-8 8 8-8 8",
  left: "M21 12H3m8-8-8 8 8 8",
  down: "M12 3v18m-8-8 8 8 8-8",
};

// Draw arrows rather than relying on platform-specific emoji/font glyphs.
export function ArrowIcon({ direction = "up-right" }: { direction?: ArrowDirection }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="square"
      strokeLinejoin="miter"
      style={{ display: "inline-block", verticalAlign: "-0.125em", flexShrink: 0 }}
    >
      <path d={paths[direction]} />
    </svg>
  );
}
