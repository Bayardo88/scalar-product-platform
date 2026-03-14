import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { SyncPayload, ValidateReport } from "../types/sync-payload";
import { computeExportHash } from "./run-pull";

const TMP_DIR = path.resolve(process.cwd(), ".scalar-sync/tmp");

function findSyncBin(): string {
  const localDist = path.resolve(__dirname, "../../node_modules/.bin/scalar-design-sync");
  if (fs.existsSync(localDist)) return localDist;

  const monorepoPath = path.resolve(__dirname, "../../../scalar-design-sync/dist/index.js");
  if (fs.existsSync(monorepoPath)) return `node ${monorepoPath}`;

  return "npx scalar-design-sync";
}

export async function runValidate(payload: SyncPayload): Promise<ValidateReport> {
  await fs.ensureDir(TMP_DIR);

  const exportHash = computeExportHash(payload);
  const tmpFile = path.join(TMP_DIR, `export-${exportHash}.json`);

  await fs.writeJson(tmpFile, payload, { spaces: 2 });

  const bin = findSyncBin();
  let output = "";
  let ok = true;

  try {
    output = execSync(
      `${bin} validate --design "${tmpFile}"`,
      { encoding: "utf-8", timeout: 15000 }
    );
  } catch (err: any) {
    ok = false;
    output = err.stdout || err.message || String(err);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const line of output.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") && trimmed.toLowerCase().includes("missing")) {
      errors.push(trimmed.replace(/^- /, ""));
    }
    if (trimmed.startsWith("- Role ")) {
      warnings.push(trimmed.replace(/^- /, ""));
    }
  }

  if (output.includes("Status: INVALID")) ok = false;
  if (output.includes("Status: VALID") && errors.length === 0) ok = true;

  return { ok, errors, warnings };
}
