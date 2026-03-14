import fs from "fs-extra";
import path from "path";
import { DesignAST, ASTNode } from "scalar-product-generator-core";

interface RegistryEntry {
  role: string;
  component: string;
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

export async function reportCommand(opts: {
  design: string;
  registry?: string;
  out?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] report`);
  console.log(`  design: ${opts.design}`);

  const design: DesignAST = await fs.readJson(opts.design);
  const registry = loadRegistry(opts.registry);

  const allRoles = collectAllRoles(design.nodes);
  const uniqueRoles = [...new Set(allRoles)].sort();
  const registryRoles = new Set(registry.map((r) => r.role));

  const mappedRoles = uniqueRoles.filter((r) => registryRoles.has(r));
  const unmappedRoles = uniqueRoles.filter((r) => !registryRoles.has(r));

  const roleCounts = new Map<string, number>();
  for (const role of allRoles) {
    roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
  }

  const coverage = uniqueRoles.length > 0
    ? ((mappedRoles.length / uniqueRoles.length) * 100).toFixed(1)
    : "0.0";

  const lines: string[] = [
    `# Scalar Design Sync - Coverage Report`,
    ``,
    `**App:** ${design.meta.appName}`,
    `**Design System:** ${design.meta.designSystem}`,
    `**Mode:** ${design.meta.mode}`,
    `**Generated:** ${design.meta.generatedAt}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Screens | ${design.screens.length} |`,
    `| Routes | ${design.routes.length} |`,
    `| Total nodes | ${design.nodes.length} |`,
    `| Unique roles | ${uniqueRoles.length} |`,
    `| Mapped roles | ${mappedRoles.length} |`,
    `| Unmapped roles | ${unmappedRoles.length} |`,
    `| Coverage | ${coverage}% |`,
    ``,
    `## Role Usage`,
    ``,
    `| Role | Count | Mapped |`,
    `|------|-------|--------|`,
  ];

  for (const role of uniqueRoles) {
    const count = roleCounts.get(role) || 0;
    const mapped = registryRoles.has(role) ? "Yes" : "No";
    lines.push(`| ${role} | ${count} | ${mapped} |`);
  }

  lines.push(``);

  if (unmappedRoles.length > 0) {
    lines.push(`## Unmapped Roles`);
    lines.push(``);
    for (const role of unmappedRoles) {
      lines.push(`- \`${role}\``);
    }
    lines.push(``);
  }

  if (mappedRoles.length > 0) {
    lines.push(`## Mapped Components`);
    lines.push(``);
    lines.push(`| Role | Component |`);
    lines.push(`|------|-----------|`);
    for (const role of mappedRoles) {
      const entry = registry.find((r) => r.role === role);
      lines.push(`| ${role} | ${entry?.component} |`);
    }
    lines.push(``);
  }

  const report = lines.join("\n");

  console.log();
  console.log(report);

  if (opts.out) {
    const reportsDir = path.join(opts.out, "reports");
    await fs.ensureDir(reportsDir);
    const reportPath = path.join(reportsDir, "coverage-report.md");
    await fs.writeFile(reportPath, report, "utf-8");
    console.log(`\nReport saved to: ${reportPath}`);
  }
}
