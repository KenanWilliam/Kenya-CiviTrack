import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger" | "amber";
};

export default function Button({
  children,
  className = "",
  variant = "ghost",
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btnPrimary"
      : variant === "danger"
      ? "btnDanger"
      : variant === "amber"
      ? "btnAmber"
      : "btnGhost";

  return (
    <button className={`btn ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
