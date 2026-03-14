import fs from "fs-extra";
import path from "path";
import os from "os";
import {
  parsePromptToBrief,
  generateAstFromBrief,
  DesignAST,
  ASTNode,
} from "scalar-product-generator-core";
import { generateAllScreens, RegistryEntry } from "../src/generators/screens";
import { generateTypesFile } from "../src/generators/types";
import { generateRoutesFile } from "../src/generators/routes";
import { generateComponentFiles } from "../src/generators/components";
import { mergeGeneratedFile } from "../src/sync/merge-engine";

const REGISTRY_PATH = path.resolve(__dirname, "../registry/registry.scalar.react.json");

function flattenNodes(nodes: ASTNode[]): ASTNode[] {
  const all: ASTNode[] = [];
  function walk(node: ASTNode) {
    all.push(node);
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return all;
}

describe("E2E: prompt → brief → AST → export → CLI pull → verify", () => {
  const prompt = "Create a project management SaaS with dashboard, projects, tasks, analytics and settings";
  let brief: ReturnType<typeof parsePromptToBrief>;
  let ast: DesignAST;
  let registry: RegistryEntry[];
  let tmpDir: string;

  beforeAll(async () => {
    brief = parsePromptToBrief(prompt);
    ast = generateAstFromBrief(brief);
    registry = await fs.readJson(REGISTRY_PATH);
    tmpDir = path.join(os.tmpdir(), `scalar-e2e-${Date.now()}`);
    await fs.ensureDir(tmpDir);
  });

  afterAll(async () => {
    await fs.remove(tmpDir);
  });

  describe("Step 1: Prompt → Brief", () => {
    it("should produce a valid brief with expected modules", () => {
      expect(brief.type).toBe("saas-app-brief");
      expect(brief.meta.designSystem).toBe("DS/Scalar");
      expect(brief.modules.some((m) => m.type === "dashboard")).toBe(true);
      expect(brief.entities.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Step 2: Brief → AST", () => {
    it("should produce a valid AST with screens and routes", () => {
      expect(ast.version).toBe("1.0");
      expect(ast.screens.length).toBeGreaterThan(0);
      expect(ast.routes.length).toBe(ast.screens.length);
      expect(ast.nodes.length).toBeGreaterThan(0);
    });

    it("should have all expected screen types", () => {
      const names = ast.screens.map((s) => s.name);
      expect(names).toContain("Login");
      expect(names).toContain("Dashboard");
      expect(names).toContain("Settings");
      expect(names.some((n) => n.includes("List"))).toBe(true);
      expect(names.some((n) => n.includes("Detail"))).toBe(true);
    });
  });

  describe("Step 3: AST → Design Export JSON (simulating Figma export)", () => {
    let exportPath: string;

    beforeAll(async () => {
      exportPath = path.join(tmpDir, "design.export.json");
      await fs.writeJson(exportPath, ast, { spaces: 2 });
    });

    it("should write a valid export file", async () => {
      expect(await fs.pathExists(exportPath)).toBe(true);
      const loaded: DesignAST = await fs.readJson(exportPath);
      expect(loaded.version).toBe(ast.version);
      expect(loaded.screens.length).toBe(ast.screens.length);
    });
  });

  describe("Step 4: CLI Pull — generate React scaffolds", () => {
    let outDir: string;
    let screenFiles: Array<{ filename: string; content: string }>;
    let typeFile: { filename: string; content: string };
    let routeFile: { filename: string; content: string };
    let componentFiles: Array<{ filename: string; content: string }>;

    beforeAll(async () => {
      outDir = path.join(tmpDir, "output");
      screenFiles = generateAllScreens(ast, registry);
      typeFile = generateTypesFile(ast);
      routeFile = generateRoutesFile(ast);
      componentFiles = generateComponentFiles(ast.nodes, registry);

      const screensDir = path.join(outDir, "src/screens/generated");
      const typesDir = path.join(outDir, "src/types/generated");
      const routesDir = path.join(outDir, "src/routes");
      const componentsDir = path.join(outDir, "src/components/generated");

      await fs.ensureDir(screensDir);
      await fs.ensureDir(typesDir);
      await fs.ensureDir(routesDir);
      await fs.ensureDir(componentsDir);

      for (const screen of screenFiles) {
        await fs.writeFile(path.join(screensDir, screen.filename), screen.content);
      }
      for (const comp of componentFiles) {
        await fs.writeFile(path.join(componentsDir, comp.filename), comp.content);
      }
      await fs.writeFile(path.join(typesDir, typeFile.filename), typeFile.content);
      await fs.writeFile(path.join(routesDir, routeFile.filename), routeFile.content);
    });

    it("should generate a screen file for each AST screen", () => {
      expect(screenFiles.length).toBe(ast.screens.length);
    });

    it("all screen files should use .generated.tsx suffix", () => {
      for (const f of screenFiles) {
        expect(f.filename).toMatch(/\.generated\.tsx$/);
      }
    });

    it("screen files should contain valid React components", () => {
      for (const f of screenFiles) {
        expect(f.content).toContain("import React");
        expect(f.content).toContain("export default function");
        expect(f.content).toContain("Generated()");
        expect(f.content).toContain("return (");
      }
    });

    it("screen files should import from @scalar/ui", () => {
      const dashboard = screenFiles.find((f) => f.filename.includes("Dashboard"));
      expect(dashboard).toBeDefined();
      expect(dashboard!.content).toContain("@scalar/ui");
    });

    it("screen files with navigation should use useNavigate", () => {
      const login = screenFiles.find((f) => f.filename.includes("Login"));
      expect(login).toBeDefined();
      expect(login!.content).toContain("useNavigate");
      expect(login!.content).toContain("navigate(");
    });

    it("screen files with data bindings should use useState", () => {
      const dashboard = screenFiles.find((f) => f.filename.includes("Dashboard"));
      expect(dashboard!.content).toContain("useState");
    });

    it("should generate component files for forms and tables", () => {
      expect(componentFiles.length).toBeGreaterThan(0);
      const formComps = componentFiles.filter((c) => c.content.includes("handleSubmit"));
      const tableComps = componentFiles.filter((c) => c.content.includes("<table"));
      expect(formComps.length).toBeGreaterThan(0);
      expect(tableComps.length).toBeGreaterThan(0);
    });

    it("should generate types file with models", () => {
      expect(typeFile.content).toContain("interface");
      expect(typeFile.content).toContain("SCREENS");
      expect(typeFile.content).toContain("ScreenMeta");
    });

    it("should generate routes with lazy loading", () => {
      expect(routeFile.content).toContain("React.lazy");
      expect(routeFile.content).toContain("generatedRoutes");
      expect(routeFile.content).toContain("/login");
      expect(routeFile.content).toContain("/dashboard");
    });

    it("all generated files should exist on disk", async () => {
      for (const screen of screenFiles) {
        const exists = await fs.pathExists(path.join(outDir, "src/screens/generated", screen.filename));
        expect(exists).toBe(true);
      }
      expect(await fs.pathExists(path.join(outDir, "src/types/generated", typeFile.filename))).toBe(true);
      expect(await fs.pathExists(path.join(outDir, "src/routes", routeFile.filename))).toBe(true);
    });
  });

  describe("Step 5: Bidirectional sync — merge engine", () => {
    it("should wrap new generated content with markers", () => {
      const result = mergeGeneratedFile("const x = 1;", null);
      expect(result.strategy).toBe("new");
      expect(result.content).toContain("@scalar-generated-start");
      expect(result.content).toContain("@scalar-generated-end");
      expect(result.content).toContain("@scalar-checksum:");
    });

    it("should detect unchanged content on re-pull", () => {
      const first = mergeGeneratedFile("const x = 1;", null);
      const second = mergeGeneratedFile("const x = 1;", first.content);
      expect(second.strategy).toBe("regenerated");
      expect(second.generatedChanged).toBe(false);
    });

    it("should preserve manual edits when generated code changes", () => {
      const first = mergeGeneratedFile("const x = 1;", null);

      const withManual = first.content.replace(
        "// Add your manual code below this line",
        "// Add your manual code below this line\n\nfunction myCustomHelper() { return 42; }"
      );

      const second = mergeGeneratedFile("const x = 2;", withManual);
      expect(second.strategy).toBe("merged-preserved");
      expect(second.hasManualEdits).toBe(true);
      expect(second.content).toContain("myCustomHelper");
      expect(second.content).toContain("const x = 2;");
    });

    it("should detect no manual edits in fresh file", () => {
      const result = mergeGeneratedFile("const x = 1;", null);
      expect(result.hasManualEdits).toBe(false);
    });
  });

  describe("Step 6: Full pipeline round-trip integrity", () => {
    it("every screen rootNodeId should resolve to a node in the AST", () => {
      const allNodes = flattenNodes(ast.nodes);
      const nodeIds = new Set(allNodes.map((n) => n.id));
      for (const screen of ast.screens) {
        expect(nodeIds.has(screen.rootNodeId)).toBe(true);
      }
    });

    it("every route should reference a valid screen", () => {
      const screenIds = new Set(ast.screens.map((s) => s.id));
      for (const route of ast.routes) {
        expect(screenIds.has(route.screenId)).toBe(true);
      }
    });

    it("generated screen count should match AST screen count", () => {
      const screenFiles = generateAllScreens(ast, registry);
      expect(screenFiles.length).toBe(ast.screens.length);
    });

    it("generated route count should match AST route count", () => {
      const routeFile = generateRoutesFile(ast);
      const routeMatches = routeFile.content.match(/path: "/g);
      expect(routeMatches?.length).toBe(ast.routes.length);
    });
  });
});
