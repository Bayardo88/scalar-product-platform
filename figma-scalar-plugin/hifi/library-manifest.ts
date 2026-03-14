export interface LibraryComponentEntry {
  role: string;
  componentKey: string;
  componentName: string;
  variantProps?: Record<string, string>;
  description?: string;
}

export interface LibraryManifest {
  libraryName: string;
  libraryId?: string;
  version: string;
  components: LibraryComponentEntry[];
}

const BUNDLED_MANIFEST: LibraryManifest = {
  libraryName: "DS/Scalar",
  version: "1.0.0",
  components: [
    { role: "navigation.sidebar", componentKey: "ds-scalar/sidebar", componentName: "Sidebar" },
    { role: "navigation.topbar", componentKey: "ds-scalar/topbar", componentName: "Topbar" },
    { role: "navigation.tabs", componentKey: "ds-scalar/tabs", componentName: "Tabs" },
    { role: "button.primaryAction", componentKey: "ds-scalar/button", componentName: "Button", variantProps: { variant: "primary", size: "md" } },
    { role: "button.secondaryAction", componentKey: "ds-scalar/button", componentName: "Button", variantProps: { variant: "secondary", size: "md" } },
    { role: "card.summary", componentKey: "ds-scalar/summary-card", componentName: "SummaryCard" },
    { role: "chart.analytics", componentKey: "ds-scalar/chart", componentName: "AnalyticsChart", variantProps: { type: "area" } },
    { role: "chart.bar", componentKey: "ds-scalar/chart", componentName: "BarChart", variantProps: { type: "bar" } },
    { role: "chart.line", componentKey: "ds-scalar/chart", componentName: "LineChart", variantProps: { type: "line" } },
    { role: "chart.pie", componentKey: "ds-scalar/chart", componentName: "PieChart", variantProps: { type: "pie" } },
    { role: "table.data", componentKey: "ds-scalar/data-table", componentName: "DataTable" },
    { role: "feed.activity", componentKey: "ds-scalar/activity-feed", componentName: "ActivityFeed" },
    { role: "panel.details", componentKey: "ds-scalar/details-panel", componentName: "DetailsPanel" },
    { role: "panel.filters", componentKey: "ds-scalar/filters-panel", componentName: "FiltersPanel" },
    { role: "input.search", componentKey: "ds-scalar/input", componentName: "SearchInput", variantProps: { type: "search" } },
    { role: "input.text", componentKey: "ds-scalar/input", componentName: "TextInput", variantProps: { type: "text" } },
    { role: "input.password", componentKey: "ds-scalar/input", componentName: "PasswordInput", variantProps: { type: "password" } },
    { role: "input.select", componentKey: "ds-scalar/select", componentName: "Select" },
    { role: "form.login", componentKey: "ds-scalar/form", componentName: "Form" },
    { role: "form.settings", componentKey: "ds-scalar/form", componentName: "Form" },
    { role: "form.container", componentKey: "ds-scalar/form", componentName: "Form" },
    { role: "overlay.modal", componentKey: "ds-scalar/modal", componentName: "Modal" },
    { role: "alert.error", componentKey: "ds-scalar/alert", componentName: "Alert", variantProps: { variant: "error" } },
    { role: "alert.success", componentKey: "ds-scalar/alert", componentName: "Alert", variantProps: { variant: "success" } },
    { role: "collection.cards", componentKey: "ds-scalar/card-grid", componentName: "CardGrid" },
  ],
};

let activeManifest: LibraryManifest = BUNDLED_MANIFEST;
let localComponentKeys = new Map<string, string>();

export function getActiveManifest(): LibraryManifest {
  return activeManifest;
}

export function setActiveManifest(manifest: LibraryManifest): void {
  activeManifest = manifest;
}

export function registerLocalComponentKey(role: string, realKey: string): void {
  localComponentKeys.set(role, realKey);
}

export function resolveComponentKey(role: string): string | undefined {
  if (localComponentKeys.has(role)) return localComponentKeys.get(role);

  const entry = activeManifest.components.find((c) => c.role === role);
  return entry?.componentKey;
}

export function resolveVariantProps(role: string): Record<string, string> | undefined {
  if (localComponentKeys.has(role)) {
    const entry = activeManifest.components.find((c) => c.role === role);
    return entry?.variantProps;
  }

  const entry = activeManifest.components.find((c) => c.role === role);
  return entry?.variantProps;
}

export async function scanDocumentForComponents(): Promise<Map<string, string>> {
  const found = new Map<string, string>();

  try {
    const localComponents = figma.currentPage.findAllWithCriteria({
      types: ["COMPONENT"],
    }) as ComponentNode[];

    for (const comp of localComponents) {
      const roleData = comp.getPluginData("role");
      if (roleData) {
        found.set(roleData, comp.key);
        registerLocalComponentKey(roleData, comp.key);
      }

      const entry = activeManifest.components.find(
        (c) => c.componentName === comp.name || comp.name.includes(c.componentName)
      );
      if (entry && !found.has(entry.role)) {
        found.set(entry.role, comp.key);
        registerLocalComponentKey(entry.role, comp.key);
      }
    }
  } catch {
    // scan may fail if page is empty or restricted
  }

  return found;
}

export function clearLocalKeys(): void {
  localComponentKeys.clear();
}

export function getLibraryStats(): {
  total: number;
  resolved: number;
  roles: string[];
} {
  const roles = activeManifest.components.map((c) => c.role);
  const resolved = roles.filter(
    (r) => localComponentKeys.has(r)
  ).length;

  return { total: roles.length, resolved, roles };
}
