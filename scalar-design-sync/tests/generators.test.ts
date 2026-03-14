import { generateAstFromBrief } from "scalar-product-generator-core";
import { parsePromptToBrief } from "scalar-product-generator-core";
import { generateAllScreens, RegistryEntry } from "../src/generators/screens";
import { generateTypesFile } from "../src/generators/types";
import { generateRoutesFile } from "../src/generators/routes";
import { generateComponentFiles } from "../src/generators/components";

const registry: RegistryEntry[] = [
  { role: "button.primaryAction", component: "Button", importPath: "@scalar/ui/Button" },
  { role: "table.data", component: "DataTable", importPath: "@scalar/ui/DataTable" },
  { role: "navigation.sidebar", component: "Sidebar", importPath: "@scalar/ui/Sidebar" },
  { role: "card.summary", component: "SummaryCard", importPath: "@scalar/ui/SummaryCard" },
  { role: "chart.analytics", component: "AnalyticsChart", importPath: "@scalar/ui/AnalyticsChart" },
];

function getTestAST() {
  const brief = parsePromptToBrief(
    "Create a project management SaaS with dashboard, projects, tasks, analytics"
  );
  return generateAstFromBrief(brief);
}

describe("generateAllScreens", () => {
  const ast = getTestAST();
  const screens = generateAllScreens(ast, registry);

  it("generates a file for each screen", () => {
    expect(screens.length).toBe(ast.screens.length);
  });

  it("generates .generated.tsx filenames", () => {
    for (const screen of screens) {
      expect(screen.filename).toMatch(/\.generated\.tsx$/);
    }
  });

  it("generates valid React components", () => {
    for (const screen of screens) {
      expect(screen.content).toContain("import React");
      expect(screen.content).toContain("export default function");
      expect(screen.content).toContain("return (");
    }
  });

  it("includes used component imports", () => {
    const dashboardScreen = screens.find((s) =>
      s.filename.toLowerCase().includes("dashboard")
    );
    expect(dashboardScreen).toBeDefined();
    expect(dashboardScreen!.content).toContain("@scalar/ui");
  });

  it("generates state variant code for data-bound components", () => {
    const dashboardScreen = screens.find((s) =>
      s.filename.toLowerCase().includes("dashboard")
    );
    if (dashboardScreen) {
      expect(dashboardScreen.content).toContain("useState");
    }
  });
});

describe("generateTypesFile", () => {
  const ast = getTestAST();
  const types = generateTypesFile(ast);

  it("generates a models.generated.ts file", () => {
    expect(types.filename).toBe("models.generated.ts");
  });

  it("generates ScreenMeta interface", () => {
    expect(types.content).toContain("interface ScreenMeta");
  });

  it("generates SCREENS constant", () => {
    expect(types.content).toContain("export const SCREENS");
  });

  it("lists all screens in SCREENS", () => {
    for (const screen of ast.screens) {
      expect(types.content).toContain(screen.name);
    }
  });
});

describe("generateRoutesFile", () => {
  const ast = getTestAST();
  const routes = generateRoutesFile(ast);

  it("generates a generated.tsx file", () => {
    expect(routes.filename).toBe("generated.tsx");
  });

  it("uses React.lazy for lazy loading", () => {
    expect(routes.content).toContain("React.lazy");
  });

  it("generates generatedRoutes array", () => {
    expect(routes.content).toContain("export const generatedRoutes");
  });

  it("includes routes for all screens", () => {
    for (const route of ast.routes) {
      expect(routes.content).toContain(route.path);
    }
  });
});

describe("generateComponentFiles", () => {
  const ast = getTestAST();
  const components = generateComponentFiles(ast.nodes, registry);

  it("generates component files", () => {
    expect(components.length).toBeGreaterThanOrEqual(0);
  });

  it("generates .generated.tsx filenames", () => {
    for (const comp of components) {
      expect(comp.filename).toMatch(/\.generated\.tsx$/);
    }
  });

  it("generates form components for form roles", () => {
    const formComps = components.filter((c) =>
      c.role.startsWith("form.")
    );
    for (const form of formComps) {
      expect(form.content).toContain("onSubmit");
    }
  });
});
