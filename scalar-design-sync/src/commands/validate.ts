import fs from "fs-extra";
import path from "path";
import { DesignAST, ASTNode } from "scalar-product-generator-core";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function collectAllRoles(nodes: ASTNode[]): string[] {
  const roles: string[] = [];
  function walk(node: ASTNode) {
    if (node.role) roles.push(node.role);
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return roles;
}

function collectAllNodes(nodes: ASTNode[]): ASTNode[] {
  const all: ASTNode[] = [];
  function walk(node: ASTNode) {
    all.push(node);
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return all;
}

interface RegistryEntry {
  role: string;
  component: string;
}

function loadRegistry(registryPath?: string): RegistryEntry[] {
  if (!registryPath) {
    const defaultPath = path.resolve(__dirname, "../../registry/registry.scalar.react.json");
    if (fs.existsSync(defaultPath)) {
      return fs.readJsonSync(defaultPath);
    }
    return [];
  }
  return fs.readJsonSync(registryPath);
}

export async function validateCommand(opts: {
  design: string;
  registry?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] validate`);
  console.log(`  design: ${opts.design}`);

  const design: DesignAST = await fs.readJson(opts.design);
  const registry = loadRegistry(opts.registry);

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!design.version) errors.push("Missing version field");
  if (!design.meta) errors.push("Missing meta field");
  if (!design.screens || design.screens.length === 0) errors.push("No screens defined");
  if (!design.nodes || design.nodes.length === 0) errors.push("No nodes defined");

  const allNodes = collectAllNodes(design.nodes);

  for (const node of allNodes) {
    if (!node.role) {
      errors.push(`Node ${node.id} (${node.name}) is missing a role`);
    }
    if (!node.id) {
      errors.push(`Node "${node.name}" is missing an id`);
    }
  }

  for (const screen of design.screens) {
    const rootNode = allNodes.find((n) => n.id === screen.rootNodeId);
    if (!rootNode) {
      errors.push(`Screen "${screen.name}" references rootNodeId "${screen.rootNodeId}" which was not found`);
    }
  }

  if (registry.length > 0) {
    const allRoles = new Set(collectAllRoles(design.nodes));
    const registryRoles = new Set(registry.map((r) => r.role));

    for (const role of allRoles) {
      if (!registryRoles.has(role)) {
        warnings.push(`Role "${role}" found in design but not mapped in registry`);
      }
    }
  }

  for (const node of allNodes) {
    if (node.interactions) {
      for (const interaction of node.interactions) {
        if (interaction.action.targetId) {
          const target = allNodes.find((n) => n.id === interaction.action.targetId);
          if (!target && !interaction.action.path) {
            warnings.push(
              `Node "${node.name}" interaction targets "${interaction.action.targetId}" which was not found`
            );
          }
        }
      }
    }
  }

  const result: ValidationResult = {
    valid: errors.length === 0,
    errors,
    warnings,
  };

  console.log();
  if (result.valid) {
    console.log("  Status: VALID");
  } else {
    console.log("  Status: INVALID");
  }

  if (errors.length > 0) {
    console.log(`\n  Errors (${errors.length}):`);
    errors.forEach((e) => console.log(`    - ${e}`));
  }

  if (warnings.length > 0) {
    console.log(`\n  Warnings (${warnings.length}):`);
    warnings.forEach((w) => console.log(`    - ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("  No issues found.");
  }
}
