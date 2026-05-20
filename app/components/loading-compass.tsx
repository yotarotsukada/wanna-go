import { CompassRose } from "./compass-rose";

interface LoadingCompassProps {
  label?: string;
  size?: number;
  className?: string;
}

export function LoadingCompass({
  label = "読み込んでいます…",
  size = 48,
  className = "",
}: LoadingCompassProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <CompassRose size={size} spin tone="deep-sea" />
      <p className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 font-serif-jp tracking-wide">
        {label}
      </p>
    </div>
  );
}
