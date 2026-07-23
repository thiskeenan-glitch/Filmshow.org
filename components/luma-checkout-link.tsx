import { LUMA_EVENT_ID, LUMA_EVENT_URL } from "@/lib/luma";

type LumaCheckoutLinkProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "quiet";
};

export function LumaCheckoutLink({
  children,
  className,
  onClick,
  variant = "primary",
}: LumaCheckoutLinkProps) {
  const variantClassName = {
    primary:
      "border border-stone-100/25 bg-stone-100 text-stone-950 hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100",
    secondary:
      "border border-stone-100/18 bg-transparent text-stone-200 hover:border-stone-100/45 hover:bg-white/[0.035] hover:text-stone-100",
    quiet: "text-stone-300 hover:text-red-200",
  }[variant];

  return (
    <a
      href={LUMA_EVENT_URL}
      className={
        className ??
        `button-shift relative inline-flex min-h-11 w-full items-center justify-center px-5 py-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.1em] sm:w-auto sm:px-6 ${variantClassName}`
      }
      data-luma-action="checkout"
      data-luma-event-id={LUMA_EVENT_ID}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
