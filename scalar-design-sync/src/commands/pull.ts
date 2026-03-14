import fs from "fs-extra";
import path from "path";
import { DesignAST } from "scalar-product-generator-core";
import { generateAllScreens, RegistryEntry } from "../generators/screens";
import { generateTypesFile } from "../generators/types";
import { generateRoutesFile } from "../generators/routes";
import { generateComponentFiles } from "../generators/components";
import { mergeGeneratedFile, MergeResult } from "../sync/merge-engine";

function loadRegistry(registryPath?: string): RegistryEntry[] {
  if (!registryPath) {
    const defaultPath = path.resolve(__dirname, "../../registry/registry.scalar.react.json");
    if (fs.existsSync(defaultPath)) return fs.readJsonSync(defaultPath);
    return [];
  }
  return fs.readJsonSync(registryPath);
}

async function writeWithMerge(
  filePath: string,
  newContent: string,
  stats: PullStats
): Promise<void> {
  let existing: string | null = null;
  if (await fs.pathExists(filePath)) {
    existing = await fs.readFile(filePath, "utf-8");
  }

  const result = mergeGeneratedFile(newContent, existing);

  await fs.writeFile(filePath, result.content, "utf-8");

  const tag = result.hasManualEdits ? ` [${result.strategy}]` : "";
  console.log(`  wrote: ${filePath}${tag}`);

  stats.total++;
  if (result.strategy === "merged-preserved") stats.merged++;
  if (result.strategy === "new") stats.created++;
  if (result.strategy === "regenerated") stats.unchanged++;
  if (result.strategy === "conflict-overwritten") stats.overwritten++;
}

interface PullStats {
  total: number;
  created: number;
  merged: number;
  unchanged: number;
  overwritten: number;
}

export async function pullCommand(opts: {
  design: string;
  out: string;
  registry?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] pull`);
  console.log(`  design: ${opts.design}`);
  console.log(`  out:    ${opts.out}`);

  const design: DesignAST = await fs.readJson(opts.design);
  const registry = loadRegistry(opts.registry);

  const screensDir = path.join(opts.out, "src/screens/generated");
  const typesDir = path.join(opts.out, "src/types/generated");
  const routesDir = path.join(opts.out, "src/routes");
  const componentsDir = path.join(opts.out, "src/components/generated");

  await fs.ensureDir(screensDir);
  await fs.ensureDir(typesDir);
  await fs.ensureDir(routesDir);
  await fs.ensureDir(componentsDir);

  const stats: PullStats = { total: 0, created: 0, merged: 0, unchanged: 0, overwritten: 0 };

  const screens = generateAllScreens(design, registry);
  for (const screen of screens) {
    await writeWithMerge(path.join(screensDir, screen.filename), screen.content, stats);
  }

  const components = generateComponentFiles(design.nodes, registry);
  for (const comp of components) {
    await writeWithMerge(path.join(componentsDir, comp.filename), comp.content, stats);
  }

  const types = generateTypesFile(design);
  await writeWithMerge(path.join(typesDir, types.filename), types.content, stats);

  const routes = generateRoutesFile(design);
  await writeWithMerge(path.join(routesDir, routes.filename), routes.content, stats);

  console.log(`\n[scalar-design-sync] Done! Generated:`);
  console.log(`  ${screens.length} screen files`);
  console.log(`  ${components.length} component files`);
  console.log(`  1 types file, 1 routes file`);
  if (stats.merged > 0) console.log(`  ${stats.merged} files merged (manual edits preserved)`);
  if (stats.unchanged > 0) console.log(`  ${stats.unchanged} files unchanged`);
  if (stats.overwritten > 0) console.log(`  ${stats.overwritten} files overwritten (conflict)`);
}
