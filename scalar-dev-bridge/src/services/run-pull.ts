import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { SyncPayload, SyncReport } from "../types/sync-payload";
import { writeReport } from "./file-reporter";

const TMP_DIR = path.resolve(process.cwd(), ".scalar-sync/tmp");
const DEFAULT_OUT_DIR = path.resolve(process.cwd(), ".scalar-sync/output");

export function computeExportHash(payload: SyncPayload): string {
  const json = JSON.stringify({
    screens: payload.screens,
    routes: payload.routes,
    nodes: payload.nodes,
  });
  return crypto.createHash("sha256").update(json).digest("hex").slice(0, 16);
}

function findSyncBin(): string {
  const localDist = path.resolve(__dirname, "../../node_modules/.bin/scalar-design-sync");
  if (fs.existsSync(localDist)) return localDist;

  const monorepoPath = path.resolve(__dirname, "../../../scalar-design-sync/dist/index.js");
  if (fs.existsSync(monorepoPath)) return `node ${monorepoPath}`;

  return "npx scalar-design-sync";
}

function extractWarningsFromOutput(output: string): string[] {
  const warnings: string[] = [];
  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- Role ") && trimmed.includes("not mapped")) {
      warnings.push(trimmed.replace(/^- /, ""));
    }
    if (trimmed.toLowerCase().includes("warning")) {
      warnings.push(trimmed);
    }
  }
  return warnings;
}

function extractGeneratedFiles(output: string): string[] {
  const files: string[] = [];
  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("wrote:")) {
      files.push(trimmed.replace(/^wrote:\s*/, "").replace(/\s*\[.*\]$/, ""));
    }
  }
  return files;
}

function extractUnmappedRoles(output: string): string[] {
  const roles: string[] = [];
  for (const line of output.split("\n")) {
    const match = line.match(/Role "(.+?)" found in design but not mapped/);
    if (match) roles.push(match[1]);
  }
  return roles;
}

function extractScreenNames(payload: SyncPayload): string[] {
  return payload.screens.map((s) => s.name);
}

export async function runPull(
  payload: SyncPayload,
  outDir?: string
): Promise<SyncReport> {
  await fs.ensureDir(TMP_DIR);
  const outputDir = outDir || DEFAULT_OUT_DIR;

  const exportHash = computeExportHash(payload);
  const tmpFile = path.join(TMP_DIR, `export-${exportHash}.json`);

  await fs.writeJson(tmpFile, payload, { spaces: 2 });

  const bin = findSyncBin();
  let output = "";
  let ok = true;

  try {
    output = execSync(
      `${bin} pull --design "${tmpFile}" --out "${outputDir}"`,
      { encoding: "utf-8", timeout: 30000 }
    );
  } catch (err: any) {
    ok = false;
    output = err.stdout || err.message || String(err);
  }

  const generatedFiles = extractGeneratedFiles(output);
  const warnings = extractWarningsFromOutput(output);
  const unmappedRoles = extractUnmappedRoles(output);
  const updatedScreens = extractScreenNames(payload);

  const report: SyncReport = {
    ok,
    generatedFiles,
    warnings,
    exportHash,
    timestamp: new Date().toISOString(),
    updatedScreens,
    unmappedRoles,
  };

  await writeReport(report);

  return report;
}
