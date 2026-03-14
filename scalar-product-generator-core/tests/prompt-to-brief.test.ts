import { parsePromptToBrief, SaaSAppBrief } from "../src";

describe("parsePromptToBrief", () => {
  it("should return a valid SaaSAppBrief shape", () => {
    const brief = parsePromptToBrief("Create a SaaS dashboard");

    expect(brief.version).toBe("1.0");
    expect(brief.type).toBe("saas-app-brief");
    expect(brief.meta.designSystem).toBe("DS/Scalar");
    expect(brief.meta.frontend).toBe("react");
    expect(brief.meta.density).toBe("comfortable");
    expect(brief.meta.theme).toBe("light");
    expect(brief.meta.breakpoints).toEqual(["mobile", "tablet", "desktop"]);
  });

  it("should always include dashboard module", () => {
    const brief = parsePromptToBrief("Build something");
    const dashboard = brief.modules.find((m) => m.type === "dashboard");
    expect(dashboard).toBeDefined();
    expect(dashboard!.enabled).toBe(true);
  });

  it("should infer project entity from prompt", () => {
    const brief = parsePromptToBrief("Create a project management tool");
    const projectEntity = brief.entities.find((e) => e.id === "Project");
    expect(projectEntity).toBeDefined();
    expect(projectEntity!.pluralLabel).toBe("Projects");
    expect(projectEntity!.fields.length).toBeGreaterThan(0);
  });

  it("should infer task entity from prompt", () => {
    const brief = parsePromptToBrief("Build a task tracker app");
    const taskEntity = brief.entities.find((e) => e.id === "Task");
    expect(taskEntity).toBeDefined();
    expect(taskEntity!.fields.some((f) => f.name === "title")).toBe(true);
  });

  it("should infer user entity from team/member keywords", () => {
    const brief = parsePromptToBrief("Build a team management dashboard");
    const userEntity = brief.entities.find((e) => e.id === "User");
    expect(userEntity).toBeDefined();
    expect(userEntity!.fields.some((f) => f.name === "email")).toBe(true);
  });

  it("should default to project+task entities if prompt is vague", () => {
    const brief = parsePromptToBrief("Build something cool");
    expect(brief.entities.length).toBeGreaterThanOrEqual(2);
    expect(brief.entities.some((e) => e.id === "Project")).toBe(true);
    expect(brief.entities.some((e) => e.id === "Task")).toBe(true);
  });

  it("should always include analytics module", () => {
    const brief = parsePromptToBrief("Build a simple app");
    const analytics = brief.modules.find((m) => m.type === "analytics");
    expect(analytics).toBeDefined();
    expect(analytics!.enabled).toBe(true);
  });

  it("should always include settings module", () => {
    const brief = parsePromptToBrief("Build a simple app");
    const settings = brief.modules.find((m) => m.type === "settings");
    expect(settings).toBeDefined();
    expect(settings!.enabled).toBe(true);
  });

  it("should enable auth flow by default", () => {
    const brief = parsePromptToBrief("Build a SaaS product");
    expect(brief.flows.auth.enabled).toBe(true);
    expect(brief.flows.auth.screens).toContain("login");
  });

  it("should use lowfi mode by default", () => {
    const brief = parsePromptToBrief("Build something");
    expect(brief.generation.mode).toBe("lowfi");
  });

  it("should set sidebar as primary navigation", () => {
    const brief = parsePromptToBrief("Build a dashboard");
    expect(brief.navigation.primary).toBe("sidebar");
  });

  it("should create entity modules for each inferred entity", () => {
    const brief = parsePromptToBrief("Project and task management");
    const entityModules = brief.modules.filter((m) => m.type === "entity");
    expect(entityModules.length).toBeGreaterThanOrEqual(2);
    expect(entityModules.some((m) => m.entityRef === "Project")).toBe(true);
    expect(entityModules.some((m) => m.entityRef === "Task")).toBe(true);
  });

  it("should store the original prompt in meta.description", () => {
    const prompt = "Create a project management SaaS";
    const brief = parsePromptToBrief(prompt);
    expect(brief.meta.description).toBe(prompt);
  });
});
