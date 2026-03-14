export interface PatternRegion {
  role: string;
  type: string;
  name: string;
  props?: Record<string, unknown>;
}

export interface PatternDefinition {
  id: string;
  category: "layout" | "screen" | "overlay" | "state";
  description: string;
  rootRole?: string;
  extends?: string;
  regions?: PatternRegion[];
  children?: PatternRegion[];
}

export const scalarPatterns: PatternDefinition[] = [
  {
    id: "pattern.appShell.sidebarTopbar",
    category: "layout",
    description: "Base app shell with sidebar and topbar",
    rootRole: "appShell",
    children: [
      { role: "navigation.sidebar", type: "Region", name: "Sidebar" },
      { role: "navigation.topbar", type: "Region", name: "Topbar" },
      { role: "content.main", type: "Region", name: "Main Content" },
    ],
  },
  {
    id: "pattern.dashboard.standard",
    category: "screen",
    description: "Dashboard with KPI cards, chart and activity feed",
    extends: "pattern.appShell.sidebarTopbar",
    regions: [
      {
        role: "collection.cards",
        type: "Collection",
        name: "KPI Cards",
        props: { itemRole: "card.summary", kind: "grid" },
      },
      { role: "chart.analytics", type: "ComponentInstance", name: "Analytics Chart" },
      { role: "feed.activity", type: "ComponentInstance", name: "Activity Feed" },
    ],
  },
  {
    id: "pattern.entity.list",
    category: "screen",
    description: "Entity list screen with toolbar, filters and table",
    extends: "pattern.appShell.sidebarTopbar",
    regions: [
      { role: "content.toolbar", type: "Region", name: "Toolbar" },
      { role: "panel.filters", type: "Region", name: "Filters" },
      { role: "table.data", type: "ComponentInstance", name: "Data Table" },
    ],
  },
  {
    id: "pattern.entity.detail",
    category: "screen",
    description: "Entity detail screen",
    extends: "pattern.appShell.sidebarTopbar",
    regions: [
      { role: "content.section", type: "Region", name: "Header Section" },
      { role: "panel.details", type: "ComponentInstance", name: "Details Panel" },
      { role: "navigation.tabs", type: "Region", name: "Tabs" },
    ],
  },
  {
    id: "pattern.entity.formModal",
    category: "overlay",
    description: "Create/edit form modal",
    rootRole: "overlay.modal",
    children: [
      { role: "form.container", type: "Form", name: "Entity Form" },
      { role: "button.secondaryAction", type: "ComponentInstance", name: "Cancel" },
      { role: "button.primaryAction", type: "ComponentInstance", name: "Save" },
    ],
  },
  {
    id: "pattern.auth.login",
    category: "screen",
    description: "Login screen",
    rootRole: "content.main",
    children: [
      { role: "text.heading", type: "Text", name: "Login" },
      { role: "form.login", type: "Form", name: "Login Form" },
      { role: "button.primaryAction", type: "ComponentInstance", name: "Sign In" },
    ],
  },
  {
    id: "pattern.analytics.overview",
    category: "screen",
    description: "Analytics overview screen",
    extends: "pattern.appShell.sidebarTopbar",
    regions: [
      { role: "chart.bar", type: "ComponentInstance", name: "Bar Chart" },
      { role: "chart.line", type: "ComponentInstance", name: "Line Chart" },
      { role: "chart.pie", type: "ComponentInstance", name: "Pie Chart" },
    ],
  },
  {
    id: "pattern.settings.standard",
    category: "screen",
    description: "Settings screen",
    extends: "pattern.appShell.sidebarTopbar",
    regions: [
      { role: "content.section", type: "Region", name: "Settings Section" },
      { role: "form.settings", type: "Form", name: "Settings Form" },
      { role: "button.primaryAction", type: "ComponentInstance", name: "Save Settings" },
    ],
  },
];

export function getPattern(id: string): PatternDefinition | undefined {
  return scalarPatterns.find((p) => p.id === id);
}
