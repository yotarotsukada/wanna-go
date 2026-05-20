import type { Category } from "../lib/constants";

interface CategoryPinProps {
  category: Category | string;
  size?: number;
  className?: string;
}

interface PinSpec {
  body: string;
  glyph: React.ReactNode;
}

const PIN_SPECS: Record<string, PinSpec> = {
  レストラン: {
    body: "#A4503A",
    glyph: (
      <g fill="#F2E8D5" stroke="#F2E8D5" strokeWidth="0.6">
        {/* フォーク */}
        <path d="M14 8 L14 17 M11.5 8 L11.5 13 M16.5 8 L16.5 13 M11.5 13 Q14 14 16.5 13" />
        {/* スプーン */}
        <ellipse cx="20" cy="10.5" rx="2.2" ry="2.8" fill="#F2E8D5" />
        <path d="M20 12.5 L20 17" />
      </g>
    ),
  },
  観光地: {
    body: "#1F3A5F",
    glyph: (
      <g fill="#F2E8D5" stroke="#F2E8D5" strokeWidth="0.5">
        {/* 旗 */}
        <path d="M14 7 L14 18" strokeWidth="1.2" />
        <path d="M14 7 L21 9 L17 11 L21 13 L14 13 Z" fill="#F2E8D5" />
      </g>
    ),
  },
  ショッピング: {
    body: "#D4A24C",
    glyph: (
      <g fill="none" stroke="#142840" strokeWidth="1.2" strokeLinecap="round">
        {/* ショッピングバッグ */}
        <path d="M12 11 L23 11 L21.5 18 L13.5 18 Z" fill="#142840" />
        <path d="M15 11 Q15 7 17.5 7 Q20 7 20 11" />
      </g>
    ),
  },
  アクティビティ: {
    body: "#3D5A3D",
    glyph: (
      <g fill="#F2E8D5">
        {/* 星 */}
        <path d="M17.5 7 L19 12 L24 12 L20 15 L21.5 20 L17.5 17 L13.5 20 L15 15 L11 12 L16 12 Z" />
      </g>
    ),
  },
  その他: {
    body: "#2A4D7A",
    glyph: (
      <g fill="#F2E8D5">
        <circle cx="17.5" cy="13" r="3" />
      </g>
    ),
  },
};

export function CategoryPin({
  category,
  size = 36,
  className,
}: CategoryPinProps) {
  const spec = PIN_SPECS[category] ?? PIN_SPECS["その他"];

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 35 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ピン本体（涙滴形） */}
      <path
        d="M17.5 2 C9 2 3 8 3 16 C3 25 17.5 42 17.5 42 C17.5 42 32 25 32 16 C32 8 26 2 17.5 2 Z"
        fill={spec.body}
        stroke="#142840"
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      {/* 内側の円窓（紙の地） */}
      <circle
        cx="17.5"
        cy="14"
        r="9"
        fill="#F2E8D5"
        opacity="0.92"
      />
      {/* シンボル */}
      {spec.glyph}
      {/* 影の楕円 */}
      <ellipse
        cx="17.5"
        cy="43"
        rx="6"
        ry="1.2"
        fill="#142840"
        opacity="0.18"
      />
    </svg>
  );
}
