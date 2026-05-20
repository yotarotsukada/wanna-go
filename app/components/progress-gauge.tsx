interface ProgressGaugeProps {
  visited: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressGauge({
  visited,
  total,
  label = "訪問済み",
  className = "",
}: ProgressGaugeProps) {
  const ratio = total > 0 ? Math.min(visited / total, 1) : 0;
  const percent = Math.round(ratio * 100);

  // 半円のパス長: 半径50の半円 = π * 50 ≈ 157.08
  const ARC_LEN = 157.08;
  const dashOffset = ARC_LEN * (1 - ratio);

  // 針の角度: -90deg (左) → +90deg (右)、半円の上向き弧上で動く
  const needleAngle = -90 + 180 * ratio;

  return (
    <div className={`paper-card px-6 py-5 ${className}`}>
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg
            width="140"
            height="80"
            viewBox="0 0 140 80"
            fill="none"
            aria-hidden="true"
          >
            {/* 背景アーク */}
            <path
              d="M 15 70 A 55 55 0 0 1 125 70"
              stroke="rgba(31,58,95,0.18)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* 進捗アーク */}
            <path
              d="M 15 70 A 55 55 0 0 1 125 70"
              stroke="#3D5A3D"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={ARC_LEN}
              strokeDashoffset={dashOffset}
              style={{
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)",
              }}
            />
            {/* 目盛り */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
              const angle = Math.PI * (1 - p);
              const x1 = 70 + Math.cos(angle) * 48;
              const y1 = 70 - Math.sin(angle) * 48;
              const x2 = 70 + Math.cos(angle) * 42;
              const y2 = 70 - Math.sin(angle) * 42;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(31,58,95,0.4)"
                  strokeWidth="1"
                />
              );
            })}
            {/* 針 */}
            <g
              style={{
                transform: `rotate(${needleAngle}deg)`,
                transformOrigin: "70px 70px",
                transition: "transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)",
              }}
            >
              <line
                x1="70"
                y1="70"
                x2="70"
                y2="22"
                stroke="#A4503A"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="70" cy="22" r="2.5" fill="#A4503A" />
            </g>
            <circle cx="70" cy="70" r="4" fill="#142840" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-deep-sea/70 dark:text-parchment/60 mb-1 font-serif-jp">
            {label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-deep-sea dark:text-parchment">
              {visited}
            </span>
            <span className="text-deep-sea-ink/60 dark:text-parchment/60 text-lg">
              / {total}
            </span>
          </div>
          <div className="text-sm text-deep-sea-ink/70 dark:text-parchment/70 mt-1">
            {percent}% 訪問済み
          </div>
        </div>
      </div>
    </div>
  );
}
