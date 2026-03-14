import { generateAstFromBrief } from "../src/generator/brief-to-ast";
import { parsePromptToBrief } from "../src/parser/prompt-to-brief";

describe("generateAstFromBrief", () => {
  const brief = parsePromptToBrief(
    "Create a project management SaaS called TaskFlow with projects, tasks, dashboard, analytics and settings"
  );
  const ast = generateAstFromBrief(brief);

  it("generates a valid DesignAST", () => {
    expect(ast.version).toBe("1.0");
    expect(ast.meta.designSystem).toBe("DS/Scalar");
    expect(ast.meta.mode).toBe("lowfi");
  });

  it("creates screens for entities", () => {
    expect(ast.screens.length).toBeGreaterThan(0);
    const screenNames = ast.screens.map((s) => s.name);
    expect(screenNames.some((n) => n.toLowerCase().includes("dashboard"))).toBe(true);
  });

  it("creates routes for all screens", () => {
    expect(ast.routes.length).toBe(ast.screens.length);
    for (const route of ast.routes) {
      const screen = ast.screens.find((s) => s.id === route.screenId);
      expect(screen).toBeDefined();
    }
  });

  it("creates nodes with valid roles", () => {
    expect(ast.nodes.length).toBeGreaterThan(0);
    for (const node of ast.nodes) {
      expect(node.role).toBeDefined();
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
    }
  });

  it("uses appShell layout for main screens", () => {
    const dashboard = ast.screens.find((s) =>
      s.name.toLowerCase().includes("dashboard")
    );
    expect(dashboard).toBeDefined();

    const route = ast.routes.find((r) => r.screenId === dashboard!.id);
    expect(route?.layout).toBe("appShell");
  });

  it("generates login screen when auth is enabled", () => {
    const briefWithAuth = parsePromptToBrief(
      "Build a SaaS with login, dashboard"
    );
    const astWithAuth = generateAstFromBrief(briefWithAuth);
    const loginScreen = astWithAuth.screens.find((s) =>
      s.name.toLowerCase().includes("login")
    );
    expect(loginScreen).toBeDefined();
  });

  it("generates analytics screen when analytics module is enabled", () => {
    const screenNames = ast.screens.map((s) => s.name.toLowerCase());
    expect(screenNames.some((n) => n.includes("analytics"))).toBe(true);
  });
});
