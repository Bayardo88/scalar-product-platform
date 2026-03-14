export const colors = {
  primary: "#3940f0",
  primaryHover: "#2d33c0",
  secondary: "#f1f1f7",
  secondaryHover: "#e4e4ee",
  surface: "#ffffff",
  background: "#fafafa",
  border: "#e2e2e6",
  borderFocus: "#3940f0",
  sidebarBg: "#16161f",
  sidebarText: "#b0b0c0",
  sidebarTextActive: "#ffffff",
  topbarBg: "#fafafb",
  topbarBorder: "#ebebed",
  text: "#111118",
  textSecondary: "#6b6b80",
  textMuted: "#9898a8",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: { fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
  subheading: { fontSize: 18, fontWeight: 600, lineHeight: 1.4 },
  body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  small: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
  label: { fontSize: 12, fontWeight: 500, lineHeight: 1.5 },
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 2px 8px rgba(0,0,0,0.06)",
  lg: "0 4px 16px rgba(0,0,0,0.08)",
} as const;
