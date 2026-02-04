import type { HTMLAttributes, ReactNode } from "react";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export default function Badge({ children, className = "", ...rest }: BadgeProps) {
  return (
    <span className={`badge ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
