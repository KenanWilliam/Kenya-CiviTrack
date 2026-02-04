import type { SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function Select({ label, className = "", children, ...rest }: SelectProps) {
  return (
    <label className="stack" style={{ gap: 6 }}>
      {label ? <span className="fieldLabel">{label}</span> : null}
      <select className={`select ${className}`.trim()} {...rest}>
        {children}
      </select>
    </label>
  );
}
