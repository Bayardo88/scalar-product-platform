import { SaaSAppBrief, BriefModule, BriefEntity } from "../types/brief";

function extractAppName(prompt: string): string {
  const match = prompt.match(
    /(?:called|named|for)\s+["']?([A-Z][A-Za-z0-9 ]+?)["']?(?:\s+with|\s+that|\s*$|\s*,)/i
  );
  if (match) return match[1].trim();

  const words = prompt.split(/\s+/).slice(0, 4);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function inferEntities(text: string): BriefEntity[] {
  const entities: BriefEntity[] = [];

  if (text.includes("project")) {
    entities.push({
      id: "Project",
      label: "Project",
      pluralLabel: "Projects",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true, ui: "input.text" },
        { name: "owner", type: "string", required: false, ui: "input.text" },
        { name: "status", type: "enum", required: true, ui: "input.select", options: ["planned", "active", "done"] },
        { name: "createdAt", type: "date", required: true },
      ],
      screens: { list: true, detail: true, create: true, edit: true },
    });
  }

  if (text.includes("task")) {
    entities.push({
      id: "Task",
      label: "Task",
      pluralLabel: "Tasks",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "title", type: "string", required: true, ui: "input.text" },
        { name: "assignee", type: "string", required: false, ui: "input.text" },
        { name: "priority", type: "enum", required: false, ui: "input.select", options: ["low", "medium", "high"] },
        { name: "status", type: "enum", required: true, ui: "input.select", options: ["todo", "in_progress", "done"] },
        { name: "dueDate", type: "date", required: false },
      ],
      screens: { list: true, detail: true, create: true, edit: true },
    });
  }

  if (text.includes("user") || text.includes("member") || text.includes("team")) {
    entities.push({
      id: "User",
      label: "User",
      pluralLabel: "Users",
      fields: [
        { name: "id", type: "string", required: true },
        { name: "name", type: "string", required: true, ui: "input.text" },
        { name: "email", type: "string", required: true, ui: "input.text" },
        { name: "role", type: "enum", required: true, ui: "input.select", options: ["admin", "member", "viewer"] },
      ],
      screens: { list: true, detail: true, create: true, edit: true },
    });
  }

  if (entities.length === 0) {
    entities.push(
      {
        id: "Project",
        label: "Project",
        pluralLabel: "Projects",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "name", type: "string", required: true, ui: "input.text" },
          { name: "status", type: "enum", required: true, ui: "input.select", options: ["planned", "active", "done"] },
        ],
        screens: { list: true, detail: true, create: true, edit: true },
      },
      {
        id: "Task",
        label: "Task",
        pluralLabel: "Tasks",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "title", type: "string", required: true, ui: "input.text" },
          { name: "status", type: "enum", required: true, ui: "input.select", options: ["todo", "in_progress", "done"] },
        ],
        screens: { list: true, detail: true, create: true, edit: true },
      }
    );
  }

  return entities;
}

export function parsePromptToBrief(prompt: string): SaaSAppBrief {
  const text = prompt.toLowerCase();

  const hasAnalytics = text.includes("analytic");
  const hasSettings = text.includes("setting");
  const hasAuth = text.includes("login") || text.includes("auth") || text.includes("sign");
  const hasDashboard = text.includes("dashboard") || text.includes("overview");

  const appName = extractAppName(prompt);
  const entities = inferEntities(text);

  const modules: BriefModule[] = [];

  if (hasDashboard || true) {
    modules.push({ id: "dashboard", type: "dashboard", label: "Dashboard", enabled: true });
  }

  for (const entity of entities) {
    modules.push({
      id: entity.id.toLowerCase() + "s",
      type: "entity",
      label: entity.pluralLabel,
      enabled: true,
      entityRef: entity.id,
    });
  }

  if (hasAnalytics || true) {
    modules.push({ id: "analytics", type: "analytics", label: "Analytics", enabled: true });
  }

  if (hasSettings || true) {
    modules.push({ id: "settings", type: "settings", label: "Settings", enabled: true });
  }

  return {
    version: "1.0",
    type: "saas-app-brief",
    meta: {
      appName,
      description: prompt,
      designSystem: "DS/Scalar",
      frontend: "react",
      density: "comfortable",
      theme: "light",
      breakpoints: ["mobile", "tablet", "desktop"],
    },
    navigation: {
      primary: "sidebar",
      secondary: "topbar",
      includeBreadcrumbs: true,
      includeSearch: true,
      includeNotifications: true,
      includeProfileMenu: true,
    },
    modules,
    entities,
    flows: {
      auth: { enabled: hasAuth || true, screens: ["login"] },
      onboarding: { enabled: false, screens: [] },
    },
    states: {
      includeLoading: true,
      includeEmpty: true,
      includeError: true,
    },
    generation: {
      mode: "lowfi",
      includeHiFiHints: true,
      includeDataBindings: true,
      includeInteractions: true,
      includeRoutes: true,
    },
  };
}
