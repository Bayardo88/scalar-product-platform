import fs from "fs-extra";
import path from "path";
import { DesignAST, ASTNode } from "scalar-product-generator-core";
import {
  scanGeneratedScreens,
  scanGeneratedComponents,
  ParsedComponent,
  CodeDesignDiff,
} from "../sync/code-parser";
import { RegistryEntry } from "../generators/screens";

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function collectUsedComponents(
  node: ASTNode,
  registry: RegistryEntry[],
  out: Set<string>
): void {
  const entry = registry.find((r) => r.role === node.role);
  if (entry) out.add(entry.component);
  if (node.children) {
    for (const child of node.children) {
      collectUsedComponents(child, registry, out);
    }
  }
}

function collectDataBindings(node: ASTNode, out: Set<string>): void {
  if (node.data?.bind) out.add(node.data.bind);
  if (node.children) {
    for (const child of node.children) {
      collectDataBindings(child, out);
    }
  }
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

function loadRegistry(registryPath?: string): RegistryEntry[] {
  if (!registryPath) {
    const defaultPath = path.resolve(
      __dirname,
      "../../registry/registry.scalar.react.json"
    );
    if (fs.existsSync(defaultPath)) return fs.readJsonSync(defaultPath);
    return [];
  }
  return fs.readJsonSync(registryPath);
}

function diffScreenToCode(
  screenName: string,
  designComponents: Set<string>,
  designBindings: Set<string>,
  codeFile: ParsedComponent | undefined
): CodeDesignDiff {
  if (!codeFile) {
    return {
      screenName,
      filePath: "",
      componentsMissingInCode: [...designComponents],
      componentsMissingInDesign: [],
      dataBindingsMissingInCode: [...designBindings],
      dataBindingsMissingInDesign: [],
      hasManualEdits: false,
      status: "design-ahead",
    };
  }

  const codeComponentSet = new Set(codeFile.usedComponents);
  const codeBindingSet = new Set(codeFile.dataBindings);

  const componentsMissingInCode = [...designComponents].filter(
    (c) => !codeComponentSet.has(c)
  );
  const componentsMissingInDesign = [...codeComponentSet].filter(
    (c) => !designComponents.has(c) && c !== "React"
  );
  const dataBindingsMissingInCode = [...designBindings].filter(
    (b) => !codeBindingSet.has(b)
  );
  const dataBindingsMissingInDesign = [...codeBindingSet].filter(
    (b) => !designBindings.has(b)
  );

  let status: CodeDesignDiff["status"] = "in-sync";
  const hasDesignDelta =
    componentsMissingInCode.length > 0 ||
    dataBindingsMissingInCode.length > 0;
  const hasCodeDelta =
    componentsMissingInDesign.length > 0 ||
    dataBindingsMissingInDesign.length > 0 ||
    codeFile.hasManualEdits;

  if (hasDesignDelta && hasCodeDelta) status = "diverged";
  else if (hasDesignDelta) status = "design-ahead";
  else if (hasCodeDelta) status = "code-ahead";

  return {
    screenName,
    filePath: codeFile.filePath,
    componentsMissingInCode,
    componentsMissingInDesign,
    dataBindingsMissingInCode,
    dataBindingsMissingInDesign,
    hasManualEdits: codeFile.hasManualEdits,
    status,
  };
}

export interface CodeDiffReport {
  diffs: CodeDesignDiff[];
  summary: {
    total: number;
    inSync: number;
    codeAhead: number;
    designAhead: number;
    diverged: number;
    filesWithManualEdits: number;
  };
  orphanedCodeFiles: string[];
}

function formatCodeDiffReport(report: CodeDiffReport): string {
  const lines: string[] = [
    `# Code ↔ Design Diff Report`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total screens | ${report.summary.total} |`,
    `| In sync | ${report.summary.inSync} |`,
    `| Code ahead | ${report.summary.codeAhead} |`,
    `| Design ahead | ${report.summary.designAhead} |`,
    `| Diverged | ${report.summary.diverged} |`,
    `| Files with manual edits | ${report.summary.filesWithManualEdits} |`,
    ``,
  ];

  if (report.orphanedCodeFiles.length > 0) {
    lines.push(`## Orphaned Code Files`);
    lines.push(`These files exist in code but have no matching design screen:`);
    lines.push(``);
    for (const f of report.orphanedCodeFiles) {
      lines.push(`- \`${f}\``);
    }
    lines.push(``);
  }

  const nonSync = report.diffs.filter((d) => d.status !== "in-sync");
  if (nonSync.length > 0) {
    lines.push(`## Screen Details`);
    lines.push(``);
    for (const diff of nonSync) {
      const badge =
        diff.status === "diverged"
          ? "DIVERGED"
          : diff.status === "code-ahead"
          ? "CODE AHEAD"
          : "DESIGN AHEAD";
      lines.push(`### ${diff.screenName} [${badge}]`);
      if (diff.hasManualEdits) lines.push(`- Has manual edits`);
      if (diff.componentsMissingInCode.length > 0) {
        lines.push(
          `- Components in design but not code: ${diff.componentsMissingInCode.join(", ")}`
        );
      }
      if (diff.componentsMissingInDesign.length > 0) {
        lines.push(
          `- Components in code but not design: ${diff.componentsMissingInDesign.join(", ")}`
        );
      }
      if (diff.dataBindingsMissingInCode.length > 0) {
        lines.push(
          `- Data bindings in design but not code: ${diff.dataBindingsMissingInCode.join(", ")}`
        );
      }
      if (diff.dataBindingsMissingInDesign.length > 0) {
        lines.push(
          `- Data bindings in code but not design: ${diff.dataBindingsMissingInDesign.join(", ")}`
        );
      }
      lines.push(``);
    }
  }

  if (nonSync.length === 0 && report.orphanedCodeFiles.length === 0) {
    lines.push(`All screens are in sync.`);
  }

  return lines.join("\n");
}

export async function codeDiffCommand(opts: {
  design: string;
  out: string;
  registry?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] code-diff`);
  console.log(`  design: ${opts.design}`);
  console.log(`  out:    ${opts.out}`);

  const design: DesignAST = await fs.readJson(opts.design);
  const registry = loadRegistry(opts.registry);

  const codeScreens = await scanGeneratedScreens(opts.out);
  const codeComponents = await scanGeneratedComponents(opts.out);

  const codeFileMap = new Map<string, ParsedComponent>();
  for (const cs of codeScreens) {
    const baseName = path.basename(cs.filePath, ".generated.tsx");
    codeFileMap.set(baseName, cs);
  }

  const diffs: CodeDesignDiff[] = [];
  const matchedCodeFiles = new Set<string>();

  for (const screen of design.screens) {
    const rootNode = findNodeById(design.nodes, screen.rootNodeId);
    const pascalName = toPascalCase(screen.name);

    const designComponents = new Set<string>();
    const designBindings = new Set<string>();

    if (rootNode) {
      collectUsedComponents(rootNode, registry, designComponents);
      collectDataBindings(rootNode, designBindings);
    }

    const codeFile = codeFileMap.get(pascalName);
    if (codeFile) matchedCodeFiles.add(pascalName);

    diffs.push(
      diffScreenToCode(screen.name, designComponents, designBindings, codeFile)
    );
  }

  const orphanedCodeFiles = [...codeFileMap.keys()]
    .filter((k) => !matchedCodeFiles.has(k))
    .map((k) => `${k}.generated.tsx`);

  const summary = {
    total: diffs.length,
    inSync: diffs.filter((d) => d.status === "in-sync").length,
    codeAhead: diffs.filter((d) => d.status === "code-ahead").length,
    designAhead: diffs.filter((d) => d.status === "design-ahead").length,
    diverged: diffs.filter((d) => d.status === "diverged").length,
    filesWithManualEdits: diffs.filter((d) => d.hasManualEdits).length,
  };

  const report: CodeDiffReport = { diffs, summary, orphanedCodeFiles };
  const formatted = formatCodeDiffReport(report);

  console.log();
  console.log(formatted);

  const reportsDir = path.join(opts.out, "reports");
  await fs.ensureDir(reportsDir);
  const reportPath = path.join(reportsDir, "code-diff-report.md");
  await fs.writeFile(reportPath, formatted, "utf-8");
  console.log(`\nReport saved to: ${reportPath}`);

  const jsonPath = path.join(reportsDir, "code-diff-report.json");
  await fs.writeJson(jsonPath, report, { spaces: 2 });
}
