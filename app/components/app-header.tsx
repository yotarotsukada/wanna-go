import { Link } from "react-router";
import { CompassRose } from "./compass-rose";

interface AppHeaderProps {
  rightSlot?: React.ReactNode;
  /** ホームに戻すリンクを無効化する場合は false */
  homeLink?: boolean;
}

export function AppHeader({ rightSlot, homeLink = true }: AppHeaderProps) {
  const Brand = (
    <span className="inline-flex items-center gap-2.5 group">
      <CompassRose size={28} tone="deep-sea" className="dark:hidden" />
      <CompassRose size={28} tone="parchment" className="hidden dark:inline" />
      <span className="font-display text-2xl text-deep-sea dark:text-parchment leading-none">
        wanna-go
      </span>
    </span>
  );

  return (
    <header className="container mx-auto px-4 pt-6">
      <div className="flex items-center justify-between">
        {homeLink ? (
          <Link
            to="/"
            className="inline-flex items-center hover:opacity-80 transition-opacity"
          >
            {Brand}
          </Link>
        ) : (
          Brand
        )}
        {rightSlot && (
          <div className="flex items-center gap-2">{rightSlot}</div>
        )}
      </div>
    </header>
  );
}
