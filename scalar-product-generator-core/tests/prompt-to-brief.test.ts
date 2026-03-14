import { parsePromptToBrief } from "../src/parser/prompt-to-brief";

describe("parsePromptToBrief", () => {
  it("extracts app name from a prompt with 'called'", () => {
    const brief = parsePromptToBrief("Create a SaaS called TaskFlow with projects and tasks");
    expect(brief.meta.appName).toBe("TaskFlow");
  });

  it("infers entities from prompt text", () => {
    const brief = parsePromptToBrief("Build a project management tool with projects, tasks, and analytics");
    const entityIds = brief.entities.map((e) => e.id);
    expect(entityIds).toContain("Project");
    expect(entityIds).toContain("Task");
  });

  it("enables analytics module when mentioned", () => {
    const brief = parsePromptToBrief("Build a SaaS with dashboard and analytics");
    const analyticsMod = brief.modules.find((m) => m.id === "analytics");
    expect(analyticsMod?.enabled).toBe(true);
  });

  it("enables settings module when mentioned", () => {
    const brief = parsePromptToBrief("Build a SaaS with settings");
    const settingsMod = brief.modules.find((m) => m.id === "settings");
    expect(settingsMod?.enabled).toBe(true);
  });

  it("always includes a dashboard module", () => {
    const brief = parsePromptToBrief("Build anything");
    const dashMod = brief.modules.find((m) => m.id === "dashboard");
    expect(dashMod?.enabled).toBe(true);
  });

  it("sets auth enabled when login is mentioned", () => {
    const brief = parsePromptToBrief("Build a SaaS with login page");
    expect(brief.flows.auth.enabled).toBe(true);
  });

  it("returns sidebar navigation by default", () => {
    const brief = parsePromptToBrief("Build a project management SaaS");
    expect(brief.navigation.primary).toBe("sidebar");
  });

  it("generates proper entity fields", () => {
    const brief = parsePromptToBrief("Build a SaaS with projects and tasks");
    const project = brief.entities.find((e) => e.id === "Project");
    expect(project).toBeDefined();
    expect(project!.fields.length).toBeGreaterThan(0);
    expect(project!.fields.find((f) => f.name === "id")).toBeDefined();
  });
});
