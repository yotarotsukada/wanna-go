interface CompassRoseProps {
  size?: number;
  spin?: boolean;
  tone?: "deep-sea" | "gold" | "rust" | "parchment";
  className?: string;
  needleRotation?: number;
}

const TONE_COLORS: Record<NonNullable<CompassRoseProps["tone"]>, string> = {
  "deep-sea": "#1F3A5F",
  gold: "#D4A24C",
  rust: "#A4503A",
  parchment: "#F2E8D5",
};

export function CompassRose({
  size = 32,
  spin = false,
  tone = "deep-sea",
  className,
  needleRotation,
}: CompassRoseProps) {
  const color = TONE_COLORS[tone];
  const needleStyle =
    needleRotation !== undefined
      ? { transform: `rotate(${needleRotation}deg)`, transformOrigin: "center" }
      : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke={color}
        strokeWidth="0.6"
        opacity="0.4"
        strokeDasharray="2 3"
      />
      {/* 東西の針 */}
      <path
        d="M6 32 L28 30 L58 32 L28 34 Z"
        fill={color}
        opacity="0.35"
      />
      {/* 南北の針（回転対象） */}
      <g
        style={needleStyle}
        className={spin ? "animate-compass-spin" : undefined}
      >
        <path d="M32 4 L36 32 L32 36 Z" fill={color} />
        <path
          d="M32 60 L28 32 L32 28 Z"
          fill={color}
          opacity="0.5"
        />
      </g>
      <circle cx="32" cy="32" r="2.4" fill={color} />
    </svg>
  );
}
