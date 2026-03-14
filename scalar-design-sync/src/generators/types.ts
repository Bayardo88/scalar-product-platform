import { DesignAST, ASTNode } from "scalar-product-generator-core";

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function collectDataBindings(nodes: ASTNode[]): Map<string, string[]> {
  const bindings = new Map<string, string[]>();

  function walk(node: ASTNode) {
    if (node.data?.bind) {
      const fields = node.data.fields ? Object.keys(node.data.fields) : ["id"];
      bindings.set(node.data.bind, fields);
    }
    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }

  for (const node of nodes) walk(node);
  return bindings;
}

export function generateTypesFile(ast: DesignAST): { filename: string; content: string } {
  const bindings = collectDataBindings(ast.nodes);
  const lines: string[] = [
    `// Auto-generated types from Design AST`,
    `// Source: ${ast.meta.appName}`,
    `// Generated: ${ast.meta.generatedAt}`,
    ``,
  ];

  for (const [bindName, fields] of bindings) {
    const typeName = toPascalCase(bindName) + "Model";
    lines.push(`export interface ${typeName} {`);
    for (const field of fields) {
      lines.push(`  ${field}: string;`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  lines.push(`export interface ScreenMeta {`);
  lines.push(`  id: string;`);
  lines.push(`  name: string;`);
  lines.push(`  path: string;`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`export const SCREENS: ScreenMeta[] = [`);
  for (const screen of ast.screens) {
    const route = ast.routes.find((r) => r.screenId === screen.id);
    lines.push(`  { id: "${screen.id}", name: "${screen.name}", path: "${route?.path || "/"}" },`);
  }
  lines.push(`];`);
  lines.push(``);

  return {
    filename: "models.generated.ts",
    content: lines.join("\n"),
  };
}
