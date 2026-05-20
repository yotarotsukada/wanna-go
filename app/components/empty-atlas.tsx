import { CompassRose } from "./compass-rose";

interface EmptyAtlasProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyAtlas({
  title,
  description,
  action,
  className = "",
}: EmptyAtlasProps) {
  return (
    <div
      className={`paper-card text-center py-16 px-6 relative overflow-hidden ${className}`}
    >
      {/* 装飾: 左上のコンパス透かし */}
      <div
        className="absolute -top-6 -left-6 opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <CompassRose size={120} tone="deep-sea" />
      </div>
      {/* 装飾: 右下の点線円 */}
      <svg
        className="absolute -bottom-10 -right-10 opacity-25 pointer-events-none"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        aria-hidden="true"
      >
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#1F3A5F"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <circle
          cx="80"
          cy="80"
          r="50"
          fill="none"
          stroke="#1F3A5F"
          strokeWidth="0.8"
          strokeDasharray="2 4"
        />
      </svg>

      <div className="relative">
        <h3 className="font-display text-2xl text-deep-sea dark:text-parchment mb-3">
          {title}
        </h3>
        {description && (
          <p className="text-deep-sea-ink/70 dark:text-parchment/70 max-w-md mx-auto leading-relaxed mb-6">
            {description}
          </p>
        )}
        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
