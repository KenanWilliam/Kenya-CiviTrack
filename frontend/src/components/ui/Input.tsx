import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = "", ...rest }: InputProps) {
  return (
    <label className="stack" style={{ gap: 6 }}>
      {label ? <span className="fieldLabel">{label}</span> : null}
      <input className={`input ${className}`.trim()} {...rest} />
    </label>
  );
}
