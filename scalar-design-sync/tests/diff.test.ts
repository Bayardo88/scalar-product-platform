import { DesignAST } from "scalar-product-generator-core";
import { diffDesignASTs } from "../src/commands/diff";

function makeBaseAST(): DesignAST {
  return {
    version: "1.0",
    meta: { appName: "Test", designSystem: "DS/Scalar", mode: "lowfi", generatedAt: "2026-01-01" },
    routes: [
      { id: "route_1", path: "/dashboard", screenId: "screen_1", layout: "appShell" },
      { id: "route_2", path: "/settings", screenId: "screen_2", layout: "appShell" },
    ],
    screens: [
      { id: "screen_1", name: "Dashboard", rootNodeId: "node_1" },
      { id: "screen_2", name: "Settings", rootNodeId: "node_2" },
    ],
    nodes: [
      {
        id: "node_1", type: "Region", role: "appShell", name: "App Shell",
        children: [
          { id: "node_1a", type: "Text", role: "text.heading", name: "Dashboard" },
        ],
      },
      {
        id: "node_2", type: "Region", role: "appShell", name: "App Shell",
        children: [
          { id: "node_2a", type: "Text", role: "text.heading", name: "Settings" },
        ],
      },
    ],
  };
}

describe("diffDesignASTs", () => {
  it("should detect no changes for identical ASTs", () => {
    const ast = makeBaseAST();
    const diff = diffDesignASTs(ast, ast);
    expect(diff.summary.totalChanges).toBe(0);
    expect(diff.summary.affectedScreenIds).toEqual([]);
  });

  it("should detect added screens", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.screens.push({ id: "screen_3", name: "Analytics", rootNodeId: "node_3" });
    newAST.routes.push({ id: "route_3", path: "/analytics", screenId: "screen_3" });
    newAST.nodes.push({ id: "node_3", type: "Region", role: "appShell", name: "Analytics Shell" });

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.screens.added.length).toBe(1);
    expect(diff.screens.added[0].name).toBe("Analytics");
    expect(diff.summary.affectedScreenIds).toContain("screen_3");
  });

  it("should detect removed screens", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.screens = newAST.screens.filter((s) => s.id !== "screen_2");
    newAST.routes = newAST.routes.filter((r) => r.screenId !== "screen_2");
    newAST.nodes = newAST.nodes.filter((n) => n.id !== "node_2");

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.screens.removed.length).toBe(1);
    expect(diff.screens.removed[0].name).toBe("Settings");
  });

  it("should detect modified screen names", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.screens[0].name = "Main Dashboard";

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.screens.modified.length).toBe(1);
    expect(diff.screens.modified[0].changes[0]).toContain("name:");
  });

  it("should detect added nodes", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.nodes[0].children!.push({
      id: "node_new", type: "ComponentInstance", role: "chart.analytics", name: "Chart",
    });

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.nodes.added).toContain("node_new");
  });

  it("should detect removed nodes", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.nodes[0].children = [];

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.nodes.removed).toContain("node_1a");
  });

  it("should detect role changes", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.nodes[0].children![0].role = "text.label";

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.nodes.roleChanged.length).toBe(1);
    expect(diff.nodes.roleChanged[0].from).toBe("text.heading");
    expect(diff.nodes.roleChanged[0].to).toBe("text.label");
  });

  it("should detect route path changes", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.routes[0].path = "/home";

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.routes.modified.length).toBe(1);
    expect(diff.routes.modified[0].changes[0]).toContain("path:");
  });

  it("should track affected screen IDs across all changes", () => {
    const oldAST = makeBaseAST();
    const newAST = makeBaseAST();
    newAST.nodes[0].children![0].role = "text.label";
    newAST.screens[1].name = "Preferences";

    const diff = diffDesignASTs(oldAST, newAST);
    expect(diff.summary.affectedScreenIds.length).toBeGreaterThanOrEqual(2);
  });
});
