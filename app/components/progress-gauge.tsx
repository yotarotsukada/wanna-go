interface ProgressGaugeProps {
  visited: number;
  total: number;
  avgPriority?: number;
  label?: string;
  className?: string;
  variant?: "card" | "inline";
}

export function ProgressGauge({
  visited,
  total,
  avgPriority,
  label = "訪問の進捗",
  className = "",
  variant = "card",
}: ProgressGaugeProps) {
  const ratio = total > 0 ? Math.min(visited / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  const Wrapper = variant === "card" ? "div" : "div";
  const wrapperClass =
    variant === "card"
      ? `surface px-6 py-5 ${className}`
      : `${className}`;

  return (
    <Wrapper className={wrapperClass}>
      <div className="flex items-end justify-between mb-3 gap-4 flex-wrap">
        <div>
          <div className="text-eyebrow mb-1">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-deep-sea dark:text-parchment leading-none">
              {visited}
            </span>
            <span className="text-deep-sea-ink/55 dark:text-parchment/55 text-sm">
              / {total} 件 訪問済み
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {avgPriority !== undefined && (
            <div>
              <div className="text-eyebrow mb-1">平均興味度</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl text-gold leading-none">
                  {avgPriority.toFixed(1)}
                </span>
                <span className="text-deep-sea-ink/55 dark:text-parchment/55 text-xs">
                  / 5
                </span>
              </div>
            </div>
          )}
          <div>
            <div className="text-eyebrow mb-1">達成率</div>
            <div className="font-display text-2xl text-moss dark:text-moss-soft leading-none">
              {percent}
              <span className="text-sm">%</span>
            </div>
          </div>
        </div>
      </div>
      {/* Linear progress bar */}
      <div
        className="relative h-2 rounded-full overflow-hidden bg-parchment-3 dark:bg-night-sea-2"
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
    </Wrapper>
  );
}
