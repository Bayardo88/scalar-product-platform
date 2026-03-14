import { DesignAST, ASTNode } from "scalar-product-generator-core";

export interface RegistryEntry {
  role: string;
  component: string;
  importPath?: string;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function findNodeById(nodes: ASTNode[], id: string): ASTNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function buildPropsString(node: ASTNode, registry: RegistryEntry[]): string {
  const parts: string[] = [];
  const className = `scalar-${node.role.replace(/\./g, "-")}`;
  parts.push(`className="${className}"`);

  if (node.props) {
    for (const [key, value] of Object.entries(node.props)) {
      if (typeof value === "string") {
        parts.push(`${key}="${value}"`);
      } else if (typeof value === "boolean") {
        parts.push(value ? key : `${key}={false}`);
      } else if (typeof value === "number") {
        parts.push(`${key}={${value}}`);
      } else {
        parts.push(`${key}={${JSON.stringify(value)}}`);
      }
    }
  }

  if (node.data?.bind) {
    parts.push(`data={${toCamelCase(node.data.bind)}}`);
    if (node.data.itemKey) {
      parts.push(`itemKey="${node.data.itemKey}"`);
    }
  }

  if (node.interactions && node.interactions.length > 0) {
    for (const interaction of node.interactions) {
      if (interaction.event === "click") {
        if (interaction.action.type === "navigate" && interaction.action.path) {
          parts.push(`onClick={() => navigate("${interaction.action.path}")}`);
        } else if (interaction.action.type === "openOverlay" && interaction.action.targetId) {
          const setter = `setShow${toPascalCase(interaction.action.targetId)}`;
          parts.push(`onClick={() => ${setter}(true)}`);
        } else if (interaction.action.type === "submitForm") {
          parts.push(`onClick={handleSubmit}`);
        }
      }
      if (interaction.event === "submit") {
        parts.push(`onSubmit={handleSubmit}`);
      }
    }
  }

  return parts.join(" ");
}

function renderNodeToJSX(node: ASTNode, registry: RegistryEntry[], indent: number): string {
  const pad = "  ".repeat(indent);
  const entry = registry.find((r) => r.role === node.role);
  const tag = entry ? entry.component : "div";
  const propsStr = buildPropsString(node, registry);

  if (node.type === "Text") {
    if (node.role === "text.heading") {
      return `${pad}<h2 ${propsStr}>${node.name}</h2>`;
    }
    return `${pad}<span ${propsStr}>${node.name}</span>`;
  }

  if (!node.children || node.children.length === 0) {
    if (entry) {
      return `${pad}<${tag} ${propsStr} />`;
    }
    return `${pad}<div ${propsStr}>{/* ${node.name} */}</div>`;
  }

  const childrenJSX = node.children
    .map((child) => renderNodeToJSX(child, registry, indent + 1))
    .join("\n");

  return `${pad}<${tag} ${propsStr}>\n${childrenJSX}\n${pad}</${tag}>`;
}

function collectUsedComponents(node: ASTNode, registry: RegistryEntry[], out: Set<string>): void {
  const entry = registry.find((r) => r.role === node.role);
  if (entry) out.add(entry.component);
  if (node.children) {
    for (const child of node.children) {
      collectUsedComponents(child, registry, out);
    }
  }
}

function collectDataBindings(node: ASTNode, out: Map<string, string>): void {
  if (node.data?.bind) {
    out.set(node.data.bind, toCamelCase(node.data.bind));
  }
  if (node.children) {
    for (const child of node.children) {
      collectDataBindings(child, out);
    }
  }
}

function collectInteractions(node: ASTNode, out: { hasNavigate: boolean; hasSubmit: boolean; overlays: Set<string> }): void {
  if (node.interactions) {
    for (const i of node.interactions) {
      if (i.action.type === "navigate") out.hasNavigate = true;
      if (i.action.type === "submitForm") out.hasSubmit = true;
      if (i.action.type === "openOverlay" && i.action.targetId) {
        out.overlays.add(i.action.targetId);
      }
    }
  }
  if (node.children) {
    for (const child of node.children) {
      collectInteractions(child, out);
    }
  }
}

export function generateScreenFile(
  ast: DesignAST,
  screenId: string,
  registry: RegistryEntry[]
): { filename: string; content: string } | null {
  const screen = ast.screens.find((s) => s.id === screenId);
  if (!screen) return null;

  const rootNode = findNodeById(ast.nodes, screen.rootNodeId);
  if (!rootNode) return null;

  const componentName = toPascalCase(screen.name) + "Generated";
  const filename = toPascalCase(screen.name) + ".generated.tsx";

  const usedComponents = new Set<string>();
  collectUsedComponents(rootNode, registry, usedComponents);

  const dataBindings = new Map<string, string>();
  collectDataBindings(rootNode, dataBindings);

  const interactions = { hasNavigate: false, hasSubmit: false, overlays: new Set<string>() };
  collectInteractions(rootNode, interactions);

  const imports: string[] = [`import React, { useState, useCallback } from "react";`];

  if (interactions.hasNavigate) {
    imports.push(`import { useNavigate } from "react-router-dom";`);
  }

  const importGroups = new Map<string, string[]>();
  for (const comp of usedComponents) {
    const entry = registry.find((r) => r.component === comp);
    const importPath = entry?.importPath || `@scalar/ui/${comp}`;
    if (!importGroups.has(importPath)) {
      importGroups.set(importPath, []);
    }
    const group = importGroups.get(importPath)!;
    if (!group.includes(comp)) {
      group.push(comp);
    }
  }
  for (const [importPath, components] of importGroups) {
    imports.push(`import { ${components.join(", ")} } from "${importPath}";`);
  }

  const hookLines: string[] = [];

  if (interactions.hasNavigate) {
    hookLines.push(`  const navigate = useNavigate();`);
  }

  for (const [, varName] of dataBindings) {
    hookLines.push(`  const [${varName}, set${toPascalCase(varName)}] = useState<any[]>([]);`);
  }

  for (const overlayId of interactions.overlays) {
    const varName = `show${toPascalCase(overlayId)}`;
    hookLines.push(`  const [${varName}, set${toPascalCase(overlayId)}] = useState(false);`);
  }

  if (interactions.hasSubmit) {
    hookLines.push(`  const handleSubmit = useCallback((e?: React.FormEvent) => {`);
    hookLines.push(`    e?.preventDefault();`);
    hookLines.push(`    // TODO: implement form submission`);
    hookLines.push(`  }, []);`);
  }

  const jsx = renderNodeToJSX(rootNode, registry, 2);
  const hooksBlock = hookLines.length > 0 ? `\n${hookLines.join("\n")}\n` : "";

  const content = `${imports.join("\n")}

export default function ${componentName}() {${hooksBlock}
  return (
${jsx}
  );
}
`;

  return { filename, content };
}

export function generateAllScreens(
  ast: DesignAST,
  registry: RegistryEntry[]
): Array<{ filename: string; content: string }> {
  const results: Array<{ filename: string; content: string }> = [];
  for (const screen of ast.screens) {
    const result = generateScreenFile(ast, screen.id, registry);
    if (result) results.push(result);
  }
  return results;
}
