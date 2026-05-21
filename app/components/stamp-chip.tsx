interface StampChipProps {
  children: React.ReactNode;
  tone?: "deep-sea" | "rust" | "gold" | "moss" | "neutral";
  className?: string;
}

const TONE_STYLES: Record<NonNullable<StampChipProps["tone"]>, string> = {
  "deep-sea":
    "text-deep-sea bg-deep-sea/8 border-deep-sea/15 dark:text-parchment dark:bg-parchment/10 dark:border-parchment/15",
  rust: "text-rust bg-rust/10 border-rust/20 dark:text-rust-soft dark:bg-rust-soft/12 dark:border-rust-soft/25",
  gold: "text-gold bg-gold/12 border-gold/25 dark:text-gold-soft dark:bg-gold-soft/10 dark:border-gold-soft/25",
  moss: "text-moss bg-moss/10 border-moss/20 dark:text-moss-soft dark:bg-moss-soft/12 dark:border-moss-soft/25",
  neutral:
    "text-deep-sea-ink/70 bg-default border-line dark:text-parchment/70 dark:bg-night-paper-2",
};

export function StampChip({
  children,
  tone = "neutral",
  className = "",
}: StampChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
