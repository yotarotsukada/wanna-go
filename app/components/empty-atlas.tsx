import { Compass } from "lucide-react";

interface EmptyAtlasProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyAtlas({
  title,
  description,
  action,
  className = "",
  icon,
}: EmptyAtlasProps) {
  return (
    <div
      className={`surface text-center py-14 px-6 ${className}`}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-default mb-4 text-deep-sea-ink/60 dark:text-parchment/60">
        {icon ?? <Compass size={22} />}
      </div>
      <h3 className="font-display text-xl text-deep-sea dark:text-parchment mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-deep-sea-ink/65 dark:text-parchment/65 max-w-md mx-auto leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
}
