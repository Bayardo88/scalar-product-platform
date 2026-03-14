import React from "react";
import { colors, radii, typography } from "./tokens";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: colors.primary, color: "#fff", border: "none" },
  secondary: { backgroundColor: colors.secondary, color: colors.text, border: `1px solid ${colors.border}` },
  ghost: { backgroundColor: "transparent", color: colors.text, border: "none" },
  danger: { backgroundColor: colors.error, color: "#fff", border: "none" },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 12 },
  md: { padding: "8px 16px", fontSize: 14 },
  lg: { padding: "12px 24px", fontSize: 16 },
};

export function Button({
  variant = "primary",
  size = "md",
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        fontFamily: typography.fontFamily,
        fontWeight: 500,
        borderRadius: radii.md,
        cursor: "pointer",
        transition: "background-color 0.15s, opacity 0.15s",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
