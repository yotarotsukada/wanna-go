import { forwardRef } from "react";

interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
  variant?: "default" | "raised" | "flat";
}

export const PaperCard = forwardRef<HTMLDivElement, PaperCardProps>(
  function PaperCard(
    {
      as: Tag = "div",
      variant = "default",
      className = "",
      children,
      ...rest
    },
    ref,
  ) {
    const variantClass =
      variant === "raised"
        ? "shadow-[0_2px_4px_rgba(20,40,64,0.12),0_16px_32px_-8px_rgba(20,40,64,0.2)]"
        : variant === "flat"
          ? "shadow-none"
          : "";

    const Component = Tag as React.ElementType;

    return (
      <Component
        ref={ref}
        className={`paper-card ${variantClass} ${className}`}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
