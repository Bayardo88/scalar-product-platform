import fs from "fs-extra";
import path from "path";
import { SyncReport } from "../types/sync-payload";

const REPORTS_DIR = path.resolve(process.cwd(), ".scalar-sync/reports");

export async function writeReport(report: SyncReport): Promise<string> {
  await fs.ensureDir(REPORTS_DIR);
  const filename = `sync-${Date.now()}.json`;
  const filePath = path.join(REPORTS_DIR, filename);
  await fs.writeJson(filePath, report, { spaces: 2 });
  return filePath;
}

export async function getReportsDir(): Promise<string> {
  await fs.ensureDir(REPORTS_DIR);
  return REPORTS_DIR;
}
