import { resolveComponentKey, resolveVariantProps } from "./library-manifest";

export interface HiFiComponentDef {
  role: string;
  componentKey?: string;
  variantProps?: Record<string, string>;
  minWidth?: number;
  minHeight?: number;
  fills?: SolidPaint[];
  cornerRadius?: number;
  textStyle?: {
    fontSize: number;
    fontWeight: string;
    color: RGB;
  };
}

const PRIMARY_COLOR: RGB = { r: 0.22, g: 0.27, b: 0.96 };
const SURFACE_COLOR: RGB = { r: 1, g: 1, b: 1 };
const SIDEBAR_BG: RGB = { r: 0.09, g: 0.09, b: 0.13 };
const TOPBAR_BG: RGB = { r: 0.98, g: 0.98, b: 0.99 };
const HEADING_COLOR: RGB = { r: 0.07, g: 0.07, b: 0.1 };

export const hifiRegistry: HiFiComponentDef[] = [
  {
    role: "navigation.sidebar",
    fills: [{ type: "SOLID", color: SIDEBAR_BG }],
    minWidth: 240,
    minHeight: 900,
    cornerRadius: 0,
  },
  {
    role: "navigation.topbar",
    fills: [{ type: "SOLID", color: TOPBAR_BG }],
    minWidth: 1200,
    minHeight: 56,
    cornerRadius: 0,
  },
  {
    role: "button.primaryAction",
    fills: [{ type: "SOLID", color: PRIMARY_COLOR }],
    minWidth: 120,
    minHeight: 40,
    cornerRadius: 8,
    textStyle: { fontSize: 14, fontWeight: "Medium", color: SURFACE_COLOR },
  },
  {
    role: "button.secondaryAction",
    fills: [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.97 } }],
    minWidth: 100,
    minHeight: 40,
    cornerRadius: 8,
    textStyle: { fontSize: 14, fontWeight: "Medium", color: { r: 0.2, g: 0.2, b: 0.25 } },
  },
  {
    role: "card.summary",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 260,
    minHeight: 100,
    cornerRadius: 12,
  },
  {
    role: "chart.analytics",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 1100,
    minHeight: 320,
    cornerRadius: 12,
  },
  {
    role: "chart.bar",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 540,
    minHeight: 320,
    cornerRadius: 12,
  },
  {
    role: "chart.line",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 540,
    minHeight: 320,
    cornerRadius: 12,
  },
  {
    role: "chart.pie",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 540,
    minHeight: 320,
    cornerRadius: 12,
  },
  {
    role: "table.data",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 1100,
    minHeight: 400,
    cornerRadius: 12,
  },
  {
    role: "feed.activity",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 1100,
    minHeight: 280,
    cornerRadius: 12,
  },
  {
    role: "panel.details",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 1100,
    minHeight: 400,
    cornerRadius: 12,
  },
  {
    role: "input.search",
    fills: [{ type: "SOLID", color: { r: 0.96, g: 0.96, b: 0.97 } }],
    minWidth: 240,
    minHeight: 40,
    cornerRadius: 8,
  },
  {
    role: "input.text",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 320,
    minHeight: 44,
    cornerRadius: 8,
  },
  {
    role: "input.password",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 320,
    minHeight: 44,
    cornerRadius: 8,
  },
  {
    role: "form.login",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 400,
    minHeight: 200,
    cornerRadius: 16,
  },
  {
    role: "form.settings",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 600,
    minHeight: 300,
    cornerRadius: 12,
  },
  {
    role: "text.heading",
    textStyle: { fontSize: 28, fontWeight: "Bold", color: HEADING_COLOR },
  },
  {
    role: "text.body",
    textStyle: { fontSize: 14, fontWeight: "Regular", color: { r: 0.2, g: 0.2, b: 0.25 } },
  },
  {
    role: "text.label",
    textStyle: { fontSize: 12, fontWeight: "Medium", color: { r: 0.4, g: 0.4, b: 0.45 } },
  },
  {
    role: "collection.cards",
    minWidth: 1100,
    minHeight: 120,
    cornerRadius: 0,
  },
  {
    role: "overlay.modal",
    fills: [{ type: "SOLID", color: SURFACE_COLOR }],
    minWidth: 480,
    minHeight: 400,
    cornerRadius: 16,
  },
  {
    role: "navigation.tabs",
    minWidth: 600,
    minHeight: 44,
    cornerRadius: 0,
  },
  {
    role: "panel.filters",
    minWidth: 1100,
    minHeight: 48,
    cornerRadius: 0,
  },
  {
    role: "alert.error",
    minWidth: 400,
    minHeight: 48,
    cornerRadius: 8,
  },
  {
    role: "alert.success",
    minWidth: 400,
    minHeight: 48,
    cornerRadius: 8,
  },
];

export function getHiFiDef(role: string): HiFiComponentDef | undefined {
  const def = hifiRegistry.find((d) => d.role === role);
  if (!def) return undefined;

  const resolvedKey = resolveComponentKey(role);
  const resolvedVariants = resolveVariantProps(role);

  return {
    ...def,
    componentKey: resolvedKey || def.componentKey,
    variantProps: resolvedVariants || def.variantProps,
  };
}
