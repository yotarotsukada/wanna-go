interface StampChipProps {
  children: React.ReactNode;
  tone?: "deep-sea" | "rust" | "gold" | "moss";
  className?: string;
}

const TONE_STYLES: Record<NonNullable<StampChipProps["tone"]>, string> = {
  "deep-sea":
    "text-deep-sea border-deep-sea/45 bg-deep-sea/5 dark:text-parchment dark:border-parchment/45 dark:bg-parchment/5",
  rust: "text-rust border-rust/55 bg-rust/8 dark:text-rust-soft dark:border-rust-soft/55 dark:bg-rust-soft/10",
  gold: "text-deep-sea-ink border-gold bg-gold/12 dark:text-gold-soft dark:border-gold-soft dark:bg-gold/10",
  moss: "text-moss border-moss/50 bg-moss/8 dark:text-moss-soft dark:border-moss-soft/55 dark:bg-moss-soft/10",
};

export function StampChip({
  children,
  tone = "deep-sea",
  className = "",
}: StampChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-dashed text-xs font-medium font-serif-jp tracking-wide ${TONE_STYLES[tone]} ${className}`}
      style={{ transform: "rotate(-0.4deg)" }}
    >
      {children}
    </span>
  );
}
