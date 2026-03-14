
import { SaaSAppBrief } from "../types/brief";

export function parsePromptToBrief(prompt: string): SaaSAppBrief {
  const text = prompt.toLowerCase();

  const hasProjects = text.includes("project");
  const hasTasks = text.includes("task");
  const hasAnalytics = text.includes("analytic");
  const hasSettings = text.includes("setting");
  const hasAuth = text.includes("login") || text.includes("auth");

  return {
    version: "1.0",
    type: "saas-app-brief",
    meta: {
      appName: "Generated SaaS",
      description: prompt,
      designSystem: "DS/Scalar",
      frontend: "react",
      density: "comfortable",
      theme: "light",
      breakpoints: ["mobile", "tablet", "desktop"]
    },
    navigation: {
      primary: "sidebar",
      secondary: "topbar",
      includeBreadcrumbs: true,
      includeSearch: true,
      includeNotifications: true,
      includeProfileMenu: true
    },
    modules: [
      { id: "dashboard", type: "dashboard", label: "Dashboard", enabled: true },
      { id: "projects", type: "entity", label: "Projects", enabled: hasProjects || true, entityRef: "Project" },
      { id: "tasks", type: "entity", label: "Tasks", enabled: hasTasks || true, entityRef: "Task" },
      { id: "analytics", type: "analytics", label: "Analytics", enabled: hasAnalytics || true },
      { id: "settings", type: "settings", label: "Settings", enabled: hasSettings || true }
    ],
    entities: [
      {
        id: "Project",
        label: "Project",
        pluralLabel: "Projects",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "name", type: "string", required: true, ui: "input.text" },
          { name: "owner", type: "string", required: false, ui: "input.text" },
          { name: "status", type: "enum", required: true, ui: "input.select", options: ["planned", "active", "done"] }
        ],
        screens: { list: true, detail: true, create: true, edit: true }
      },
      {
        id: "Task",
        label: "Task",
        pluralLabel: "Tasks",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "title", type: "string", required: true, ui: "input.text" },
          { name: "assignee", type: "string", required: false, ui: "input.text" },
          { name: "status", type: "enum", required: true, ui: "input.select", options: ["todo", "in_progress", "done"] }
        ],
        screens: { list: true, detail: true, create: true, edit: true }
      }
    ],
    flows: {
      auth: { enabled: hasAuth || true, screens: ["login"] },
      onboarding: { enabled: false, screens: [] }
    },
    states: {
      includeLoading: true,
      includeEmpty: true,
      includeError: true
    },
    generation: {
      mode: "lowfi",
      includeHiFiHints: true,
      includeDataBindings: true,
      includeInteractions: true,
      includeRoutes: true
    }
  };
}
