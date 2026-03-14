
import { DesignAST, ASTNode } from "../types/ast";
import { SaaSAppBrief } from "../types/brief";

let idCounter = 1;
function nextId(prefix: string): string {
  return `${prefix}_${idCounter++}`;
}

function pushNode(nodes: ASTNode[], node: ASTNode): ASTNode {
  nodes.push(node);
  return node;
}

function appShellNodes(nodes: ASTNode[]) {
  const sidebar = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "navigation.sidebar",
    name: "Sidebar",
    layout: { display: "stack", direction: "vertical", gap: 16 }
  });

  const topbar = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "navigation.topbar",
    name: "Topbar",
    layout: { display: "stack", direction: "horizontal", gap: 12 }
  });

  const main = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "content.main",
    name: "Main Content",
    layout: { display: "stack", direction: "vertical", gap: 24 }
  });

  const root = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "appShell",
    name: "App Shell",
    layout: { display: "stack", direction: "vertical", gap: 24, padding: { top: 24, right: 24, bottom: 24, left: 24 } },
    children: [sidebar, topbar, main]
  });

  return { root, main };
}

function createDashboard(nodes: ASTNode[]) {
  const shell = appShellNodes(nodes);

  const cards = pushNode(nodes, {
    id: nextId("node"),
    type: "Collection",
    role: "collection.cards",
    name: "KPI Cards",
    props: { itemRole: "card.summary", kind: "grid" },
    data: { bind: "kpis", itemKey: "id" }
  });

  const chart = pushNode(nodes, {
    id: nextId("node"),
    type: "ComponentInstance",
    role: "chart.analytics",
    name: "Analytics Chart"
  });

  const feed = pushNode(nodes, {
    id: nextId("node"),
    type: "ComponentInstance",
    role: "feed.activity",
    name: "Activity Feed"
  });

  shell.main.children = [cards, chart, feed];
  return { screenName: "Dashboard", root: shell.root };
}

function createEntityList(nodes: ASTNode[], entityName: string, pluralLabel: string) {
  const shell = appShellNodes(nodes);

  const toolbar = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "content.toolbar",
    name: `${pluralLabel} Toolbar`,
    children: [
      { id: nextId("node"), type: "Text", role: "text.heading", name: pluralLabel },
      { id: nextId("node"), type: "ComponentInstance", role: "input.search", name: "Search" },
      { id: nextId("node"), type: "ComponentInstance", role: "button.primaryAction", name: `Create ${entityName}` }
    ]
  });

  const table = pushNode(nodes, {
    id: nextId("node"),
    type: "ComponentInstance",
    role: "table.data",
    name: `${pluralLabel} Table`,
    data: { bind: pluralLabel.toLowerCase(), itemKey: "id" }
  });

  shell.main.children = [toolbar, table];
  return { screenName: `${pluralLabel} List`, root: shell.root };
}

function createEntityDetail(nodes: ASTNode[], entityName: string) {
  const shell = appShellNodes(nodes);

  const header = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "content.section",
    name: `${entityName} Header`,
    children: [
      { id: nextId("node"), type: "Text", role: "text.heading", name: `${entityName} Detail` },
      { id: nextId("node"), type: "ComponentInstance", role: "button.secondaryAction", name: "Back" },
      { id: nextId("node"), type: "ComponentInstance", role: "button.primaryAction", name: "Edit" }
    ]
  });

  const details = pushNode(nodes, {
    id: nextId("node"),
    type: "ComponentInstance",
    role: "panel.details",
    name: `${entityName} Details`,
    data: { bind: entityName.toLowerCase() }
  });

  shell.main.children = [header, details];
  return { screenName: `${entityName} Detail`, root: shell.root };
}

function createSettings(nodes: ASTNode[]) {
  const shell = appShellNodes(nodes);

  const section = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "content.section",
    name: "Settings Section",
    children: [
      { id: nextId("node"), type: "Text", role: "text.heading", name: "Settings" },
      { id: nextId("node"), type: "Form", role: "form.settings", name: "Settings Form" },
      { id: nextId("node"), type: "ComponentInstance", role: "button.primaryAction", name: "Save Settings" }
    ]
  });

  shell.main.children = [section];
  return { screenName: "Settings", root: shell.root };
}

function createLogin(nodes: ASTNode[]) {
  const root = pushNode(nodes, {
    id: nextId("node"),
    type: "Region",
    role: "content.main",
    name: "Login Screen",
    layout: { display: "stack", direction: "vertical", gap: 16, padding: { top: 32, right: 32, bottom: 32, left: 32 } },
    children: [
      { id: nextId("node"), type: "Text", role: "text.heading", name: "Login" },
      { id: nextId("node"), type: "Form", role: "form.login", name: "Login Form" },
      { id: nextId("node"), type: "ComponentInstance", role: "button.primaryAction", name: "Sign In" }
    ]
  });

  return { screenName: "Login", root };
}

export function generateAstFromBrief(brief: SaaSAppBrief): DesignAST {
  idCounter = 1;
  const nodes: ASTNode[] = [];
  const screens: DesignAST["screens"] = [];
  const routes: DesignAST["routes"] = [];

  if (brief.flows.auth.enabled) {
    const login = createLogin(nodes);
    const loginScreenId = nextId("screen");
    screens.push({ id: loginScreenId, name: login.screenName, rootNodeId: login.root.id });
    routes.push({ id: nextId("route"), path: "/login", screenId: loginScreenId });
  }

  const dashboard = createDashboard(nodes);
  const dashboardScreenId = nextId("screen");
  screens.push({ id: dashboardScreenId, name: dashboard.screenName, rootNodeId: dashboard.root.id });
  routes.push({ id: nextId("route"), path: "/dashboard", screenId: dashboardScreenId, layout: "appShell" });

  for (const entity of brief.entities) {
    if (entity.screens.list) {
      const list = createEntityList(nodes, entity.label, entity.pluralLabel);
      const screenId = nextId("screen");
      screens.push({ id: screenId, name: list.screenName, rootNodeId: list.root.id });
      routes.push({ id: nextId("route"), path: `/${entity.pluralLabel.toLowerCase()}`, screenId, layout: "appShell" });
    }

    if (entity.screens.detail) {
      const detail = createEntityDetail(nodes, entity.label);
      const screenId = nextId("screen");
      screens.push({ id: screenId, name: detail.screenName, rootNodeId: detail.root.id });
      routes.push({ id: nextId("route"), path: `/${entity.pluralLabel.toLowerCase()}/:id`, screenId, layout: "appShell" });
    }
  }

  const settings = createSettings(nodes);
  const settingsScreenId = nextId("screen");
  screens.push({ id: settingsScreenId, name: settings.screenName, rootNodeId: settings.root.id });
  routes.push({ id: nextId("route"), path: "/settings", screenId: settingsScreenId, layout: "appShell" });

  return {
    version: "1.0",
    meta: {
      appName: brief.meta.appName,
      designSystem: brief.meta.designSystem,
      mode: brief.generation.mode,
      generatedAt: new Date().toISOString()
    },
    routes,
    screens,
    nodes
  };
}
