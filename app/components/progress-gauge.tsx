interface ProgressGaugeProps {
  visited: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressGauge({
  visited,
  total,
  label = "訪問の進捗",
  className = "",
}: ProgressGaugeProps) {
  const ratio = total > 0 ? Math.min(visited / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  return (
    <div className={`surface px-5 py-4 ${className}`}>
      <div className="flex items-end justify-between mb-3 gap-4 flex-wrap">
        <div>
          <div className="text-eyebrow mb-1">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-deep-sea dark:text-parchment leading-none">
              {visited}
            </span>
            <span className="text-deep-sea-ink/55 dark:text-parchment/55 text-sm">
              / {total} 件
            </span>
          </div>
        </div>
        <div className="font-display text-2xl text-moss dark:text-moss-soft leading-none">
          {percent}
          <span className="text-sm">%</span>
        </div>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden bg-content3 dark:bg-night-sea-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-moss to-moss-soft dark:from-moss-soft dark:to-gold-soft"
          style={{
            width: `${percent}%`,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}
