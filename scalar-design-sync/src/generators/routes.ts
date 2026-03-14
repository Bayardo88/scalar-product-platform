import { DesignAST } from "scalar-product-generator-core";

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function generateRoutesFile(ast: DesignAST): { filename: string; content: string } {
  const lines: string[] = [
    `// Auto-generated routes from Design AST`,
    `// Source: ${ast.meta.appName}`,
    `// Generated: ${ast.meta.generatedAt}`,
    ``,
    `import React from "react";`,
    ``,
  ];

  const imports: string[] = [];
  for (const screen of ast.screens) {
    const componentName = toPascalCase(screen.name) + "Generated";
    imports.push(
      `const ${componentName} = React.lazy(() => import("../screens/generated/${toPascalCase(screen.name)}.generated"));`
    );
  }
  lines.push(...imports);
  lines.push(``);

  lines.push(`export interface GeneratedRoute {`);
  lines.push(`  path: string;`);
  lines.push(`  component: React.LazyExoticComponent<React.ComponentType>;`);
  lines.push(`  screenId: string;`);
  lines.push(`  layout?: string;`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export const generatedRoutes: GeneratedRoute[] = [`);
  for (const route of ast.routes) {
    const screen = ast.screens.find((s) => s.id === route.screenId);
    if (!screen) continue;
    const componentName = toPascalCase(screen.name) + "Generated";
    const layoutStr = route.layout ? `, layout: "${route.layout}"` : "";
    lines.push(
      `  { path: "${route.path}", component: ${componentName}, screenId: "${route.screenId}"${layoutStr} },`
    );
  }
  lines.push(`];`);
  lines.push(``);

  return {
    filename: "generated.tsx",
    content: lines.join("\n"),
  };
}
