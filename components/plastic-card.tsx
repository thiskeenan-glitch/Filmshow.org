import type { CSSProperties, ReactNode } from "react";

type PlasticCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  reveal?: boolean;
  texture?: "plastic1" | "plastic2" | "noise";
  opacity?: number;
};

export function PlasticCard({
  children,
  className = "",
  style,
  reveal = false,
}: PlasticCardProps) {
  return (
    <div
      data-reveal={reveal ? "card" : undefined}
      style={style}
      className={`relative overflow-hidden border border-stone-100/[0.075] bg-white/[0.014] ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
