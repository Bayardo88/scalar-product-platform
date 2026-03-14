import fs from "fs-extra";
import path from "path";
import { DesignAST } from "scalar-product-generator-core";
import { generateAllScreens, RegistryEntry } from "../src/generators/screens";
import { generateTypesFile } from "../src/generators/types";
import { generateRoutesFile } from "../src/generators/routes";
import { generateComponentFiles } from "../src/generators/components";

const DESIGN_EXPORT = path.resolve(__dirname, "../../examples/design.export.json");
const REGISTRY_PATH = path.resolve(__dirname, "../registry/registry.scalar.react.json");

describe("generators", () => {
  let design: DesignAST;
  let registry: RegistryEntry[];

  beforeAll(async () => {
    design = await fs.readJson(DESIGN_EXPORT);
    registry = await fs.readJson(REGISTRY_PATH);
  });

  describe("generateAllScreens", () => {
    it("should generate a file for each screen", () => {
      const screens = generateAllScreens(design, registry);
      expect(screens.length).toBe(design.screens.length);
    });

    it("should use PascalCase + Generated suffix", () => {
      const screens = generateAllScreens(design, registry);
      for (const screen of screens) {
        expect(screen.filename).toMatch(/\.generated\.tsx$/);
        expect(screen.content).toContain("Generated()");
      }
    });

    it("should include React import", () => {
      const screens = generateAllScreens(design, registry);
      for (const screen of screens) {
        expect(screen.content).toContain("import React");
      }
    });

    it("should include component imports from @scalar/ui", () => {
      const screens = generateAllScreens(design, registry);
      const dashboard = screens.find((s) => s.filename.includes("Dashboard"));
      expect(dashboard).toBeDefined();
      expect(dashboard!.content).toContain("@scalar/ui");
    });

    it("should include data binding state hooks", () => {
      const screens = generateAllScreens(design, registry);
      const dashboard = screens.find((s) => s.filename.includes("Dashboard"));
      expect(dashboard!.content).toContain("useState");
    });

    it("should include navigate when interactions have navigation", () => {
      const screens = generateAllScreens(design, registry);
      const login = screens.find((s) => s.filename.includes("Login"));
      expect(login!.content).toContain("useNavigate");
      expect(login!.content).toContain("navigate(");
    });

    it("should include className props based on role", () => {
      const screens = generateAllScreens(design, registry);
      for (const screen of screens) {
        expect(screen.content).toContain("className=");
      }
    });
  });

  describe("generateTypesFile", () => {
    it("should generate a models file", () => {
      const types = generateTypesFile(design);
      expect(types.filename).toBe("models.generated.ts");
      expect(types.content).toContain("interface");
    });

    it("should include SCREENS constant", () => {
      const types = generateTypesFile(design);
      expect(types.content).toContain("SCREENS");
      expect(types.content).toContain("ScreenMeta");
    });

    it("should contain model interfaces from data bindings", () => {
      const types = generateTypesFile(design);
      expect(types.content).toContain("Model");
    });
  });

  describe("generateRoutesFile", () => {
    it("should generate a routes file", () => {
      const routes = generateRoutesFile(design);
      expect(routes.filename).toBe("generated.tsx");
      expect(routes.content).toContain("generatedRoutes");
    });

    it("should use lazy loading", () => {
      const routes = generateRoutesFile(design);
      expect(routes.content).toContain("React.lazy");
    });

    it("should have correct route paths", () => {
      const routes = generateRoutesFile(design);
      expect(routes.content).toContain("/login");
      expect(routes.content).toContain("/dashboard");
    });
  });

  describe("generateComponentFiles", () => {
    it("should generate form components", () => {
      const components = generateComponentFiles(design.nodes, registry);
      const forms = components.filter((c) => c.role.startsWith("form."));
      expect(forms.length).toBeGreaterThan(0);
    });

    it("should generate table components", () => {
      const components = generateComponentFiles(design.nodes, registry);
      const tables = components.filter((c) => c.role === "table.data");
      expect(tables.length).toBeGreaterThan(0);
    });

    it("form components should include handleSubmit", () => {
      const components = generateComponentFiles(design.nodes, registry);
      const form = components.find((c) => c.role.startsWith("form."));
      expect(form!.content).toContain("handleSubmit");
      expect(form!.content).toContain("onSubmit");
    });

    it("table component should render rows from data", () => {
      const components = generateComponentFiles(design.nodes, registry);
      const table = components.find((c) => c.role === "table.data");
      expect(table!.content).toContain("data.map");
      expect(table!.content).toContain("<table");
    });
  });
});
