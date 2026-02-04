import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: "default" | "soft";
};

export default function Card({ children, className = "", variant = "default", ...rest }: CardProps) {
  const variantClass = variant === "soft" ? "cardSoft" : "";
  return (
    <div className={`card ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
