import React from "react";
import { spacing } from "./tokens";

export interface CardGridProps {
  columns?: number;
  gap?: number;
  children: React.ReactNode;
  className?: string;
}

export function CardGrid({ columns = 4, gap = spacing.lg, children, className }: CardGridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
