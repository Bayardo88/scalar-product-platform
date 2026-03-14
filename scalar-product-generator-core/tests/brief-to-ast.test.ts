import { parsePromptToBrief, generateAstFromBrief, DesignAST, ASTNode } from "../src";

function flattenNodes(nodes: ASTNode[]): ASTNode[] {
  const all: ASTNode[] = [];
  function walk(node: ASTNode) {
    all.push(node);
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return all;
}

describe("generateAstFromBrief", () => {
  let ast: DesignAST;

  beforeAll(() => {
    const brief = parsePromptToBrief(
      "Create a project management SaaS with dashboard, projects, tasks, analytics and settings"
    );
    ast = generateAstFromBrief(brief);
  });

  it("should return a valid DesignAST shape", () => {
    expect(ast.version).toBe("1.0");
    expect(ast.meta.designSystem).toBe("DS/Scalar");
    expect(ast.meta.mode).toBe("lowfi");
    expect(ast.meta.generatedAt).toBeTruthy();
  });

  it("should generate screens", () => {
    expect(ast.screens.length).toBeGreaterThan(0);
    for (const screen of ast.screens) {
      expect(screen.id).toBeTruthy();
      expect(screen.name).toBeTruthy();
      expect(screen.rootNodeId).toBeTruthy();
    }
  });

  it("should generate routes matching screens", () => {
    expect(ast.routes.length).toBe(ast.screens.length);
    for (const route of ast.routes) {
      const screen = ast.screens.find((s) => s.id === route.screenId);
      expect(screen).toBeDefined();
    }
  });

  it("should generate a login screen", () => {
    const loginScreen = ast.screens.find((s) => s.name === "Login");
    expect(loginScreen).toBeDefined();
    const loginRoute = ast.routes.find((r) => r.path === "/login");
    expect(loginRoute).toBeDefined();
  });

  it("should generate a dashboard screen with KPI cards, chart, feed", () => {
    const dashScreen = ast.screens.find((s) => s.name === "Dashboard");
    expect(dashScreen).toBeDefined();

    const allNodes = flattenNodes(ast.nodes);
    const rootNode = allNodes.find((n) => n.id === dashScreen!.rootNodeId);
    expect(rootNode).toBeDefined();

    const roles = flattenNodes([rootNode!]).map((n) => n.role);
    expect(roles).toContain("chart.analytics");
    expect(roles).toContain("feed.activity");
    expect(roles).toContain("collection.cards");
  });

  it("should generate entity list screens with toolbar and table", () => {
    const listScreens = ast.screens.filter((s) => s.name.includes("List"));
    expect(listScreens.length).toBeGreaterThan(0);

    for (const screen of listScreens) {
      const rootNode = flattenNodes(ast.nodes).find((n) => n.id === screen.rootNodeId);
      expect(rootNode).toBeDefined();
      const roles = flattenNodes([rootNode!]).map((n) => n.role);
      expect(roles).toContain("table.data");
      expect(roles).toContain("content.toolbar");
    }
  });

  it("should generate entity detail screens with details panel", () => {
    const detailScreens = ast.screens.filter((s) => s.name.includes("Detail"));
    expect(detailScreens.length).toBeGreaterThan(0);

    for (const screen of detailScreens) {
      const rootNode = flattenNodes(ast.nodes).find((n) => n.id === screen.rootNodeId);
      expect(rootNode).toBeDefined();
      const roles = flattenNodes([rootNode!]).map((n) => n.role);
      expect(roles).toContain("panel.details");
    }
  });

  it("should generate analytics screen with chart types", () => {
    const analyticsScreen = ast.screens.find((s) => s.name === "Analytics");
    expect(analyticsScreen).toBeDefined();

    const rootNode = flattenNodes(ast.nodes).find((n) => n.id === analyticsScreen!.rootNodeId);
    const roles = flattenNodes([rootNode!]).map((n) => n.role);
    expect(roles).toContain("chart.bar");
    expect(roles).toContain("chart.line");
    expect(roles).toContain("chart.pie");
  });

  it("should generate settings screen with form", () => {
    const settingsScreen = ast.screens.find((s) => s.name === "Settings");
    expect(settingsScreen).toBeDefined();

    const rootNode = flattenNodes(ast.nodes).find((n) => n.id === settingsScreen!.rootNodeId);
    const roles = flattenNodes([rootNode!]).map((n) => n.role);
    expect(roles).toContain("form.settings");
  });

  it("should include app shell structure in dashboard screens", () => {
    const dashScreen = ast.screens.find((s) => s.name === "Dashboard");
    const rootNode = flattenNodes(ast.nodes).find((n) => n.id === dashScreen!.rootNodeId);
    expect(rootNode!.role).toBe("appShell");

    const childRoles = flattenNodes([rootNode!]).map((n) => n.role);
    expect(childRoles).toContain("navigation.sidebar");
    expect(childRoles).toContain("navigation.topbar");
    expect(childRoles).toContain("content.main");
  });

  it("should assign unique IDs to all nodes", () => {
    const allNodes = flattenNodes(ast.nodes);
    const idCounts = new Map<string, number>();
    for (const node of allNodes) {
      idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1);
    }
    const duplicateIds = [...idCounts.entries()].filter(([, count]) => {
      const nodesWithId = allNodes.filter((n) => n.id === [...idCounts.entries()].find(([id]) => id === n.id)?.[0]);
      return count > 1 && new Set(nodesWithId.map((n) => n)).size > 1;
    });
    const uniqueIds = new Set(allNodes.map((n) => n.id));
    expect(uniqueIds.size).toBeGreaterThan(0);
    for (const id of uniqueIds) {
      const nodesWithId = allNodes.filter((n) => n.id === id);
      const uniqueRefs = new Set(nodesWithId);
      expect(uniqueRefs.size).toBe(1);
    }
  });

  it("should generate data bindings for entity tables", () => {
    const allNodes = flattenNodes(ast.nodes);
    const tables = allNodes.filter((n) => n.role === "table.data");
    expect(tables.length).toBeGreaterThan(0);
    for (const table of tables) {
      expect(table.data?.bind).toBeTruthy();
    }
  });

  it("should include interactions on buttons", () => {
    const allNodes = flattenNodes(ast.nodes);
    const signIn = allNodes.find((n) => n.name === "Sign In");
    expect(signIn).toBeDefined();
    expect(signIn!.interactions).toBeDefined();
    expect(signIn!.interactions!.length).toBeGreaterThan(0);
    expect(signIn!.interactions![0].action.type).toBe("navigate");
  });

  it("should reset IDs between calls", () => {
    const brief = parsePromptToBrief("Simple app");
    const ast1 = generateAstFromBrief(brief);
    const ast2 = generateAstFromBrief(brief);
    expect(ast1.nodes[0].id).toBe(ast2.nodes[0].id);
  });
});
