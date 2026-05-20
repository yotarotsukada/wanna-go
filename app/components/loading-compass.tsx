import { Loader2 } from "lucide-react";

interface LoadingCompassProps {
  label?: string;
  className?: string;
}

export function LoadingCompass({
  label = "読み込み中…",
  className = "",
}: LoadingCompassProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={24}
        className="text-deep-sea-ink/50 dark:text-parchment/50 animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm text-deep-sea-ink/60 dark:text-parchment/60">
        {label}
      </p>
    </div>
  );
}
