import type { CSSProperties } from "react";

export type SkeletonProps = {
  height?: number | string;
  width?: number | string;
  style?: CSSProperties;
  className?: string;
};

export default function Skeleton({ height = 16, width = "100%", style, className = "" }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{ height, width, ...style }}
    />
  );
}
