import fs from "fs-extra";
import path from "path";

const DESIGN_EXPORT = path.resolve(__dirname, "../../examples/design.export.json");

describe("validate logic", () => {
  let design: any;

  beforeAll(async () => {
    design = await fs.readJson(DESIGN_EXPORT);
  });

  it("should have a version field", () => {
    expect(design.version).toBeTruthy();
  });

  it("should have meta with required fields", () => {
    expect(design.meta).toBeDefined();
    expect(design.meta.appName).toBeTruthy();
    expect(design.meta.designSystem).toBe("DS/Scalar");
    expect(design.meta.mode).toBeTruthy();
  });

  it("should have screens", () => {
    expect(design.screens.length).toBeGreaterThan(0);
  });

  it("should have nodes", () => {
    expect(design.nodes.length).toBeGreaterThan(0);
  });

  it("all screens should have rootNodeId matching a node", () => {
    function flattenNodes(nodes: any[]): any[] {
      const all: any[] = [];
      function walk(node: any) {
        all.push(node);
        if (node.children) node.children.forEach(walk);
      }
      nodes.forEach(walk);
      return all;
    }

    const allNodes = flattenNodes(design.nodes);
    const nodeIds = new Set(allNodes.map((n: any) => n.id));

    for (const screen of design.screens) {
      expect(nodeIds.has(screen.rootNodeId)).toBe(true);
    }
  });

  it("all nodes should have an id", () => {
    function walk(node: any) {
      expect(node.id).toBeTruthy();
      if (node.children) node.children.forEach(walk);
    }
    design.nodes.forEach(walk);
  });

  it("all nodes should have a role", () => {
    function walk(node: any) {
      expect(node.role).toBeTruthy();
      if (node.children) node.children.forEach(walk);
    }
    design.nodes.forEach(walk);
  });

  it("routes should reference valid screen IDs", () => {
    const screenIds = new Set(design.screens.map((s: any) => s.id));
    for (const route of design.routes) {
      expect(screenIds.has(route.screenId)).toBe(true);
    }
  });

  it("should have expected screens: login, dashboard, settings", () => {
    const names = design.screens.map((s: any) => s.name);
    expect(names).toContain("Login");
    expect(names).toContain("Dashboard");
    expect(names).toContain("Settings");
  });
});
