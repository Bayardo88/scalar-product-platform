import React from "react";
import { colors, spacing, radii, typography } from "./tokens";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: spacing.lg, fontFamily: typography.fontFamily }}
      {...props}
    >
      {children}
    </form>
  );
}

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: TextInputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary }}>{label}</label>}
      <input
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: radii.md,
          border: `1px solid ${error ? colors.error : colors.border}`,
          fontSize: 14,
          fontFamily: typography.fontFamily,
          color: colors.text,
          outline: "none",
          transition: "border-color 0.15s",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: colors.error }}>{error}</span>}
    </div>
  );
}

export function PasswordInput(props: TextInputProps) {
  return <TextInput type="password" {...props} />;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, options, style, ...props }: SelectProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: colors.textSecondary }}>{label}</label>}
      <select
        style={{
          padding: `${spacing.sm}px ${spacing.md}px`,
          borderRadius: radii.md,
          border: `1px solid ${colors.border}`,
          fontSize: 14,
          fontFamily: typography.fontFamily,
          color: colors.text,
          backgroundColor: colors.surface,
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ onSearch, style, ...props }: SearchInputProps) {
  return (
    <input
      type="search"
      placeholder="Search..."
      onChange={(e) => onSearch?.(e.target.value)}
      style={{
        padding: `${spacing.sm}px ${spacing.md}px`,
        borderRadius: radii.md,
        border: `1px solid ${colors.border}`,
        fontSize: 14,
        fontFamily: typography.fontFamily,
        color: colors.text,
        backgroundColor: colors.background,
        outline: "none",
        width: 240,
        ...style,
      }}
      {...props}
    />
  );
}
