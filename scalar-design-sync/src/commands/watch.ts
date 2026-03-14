import fs from "fs-extra";
import path from "path";
import { pullCommand } from "./pull";

export async function watchCommand(opts: {
  design: string;
  out: string;
  registry?: string;
}): Promise<void> {
  console.log(`[scalar-design-sync] watch`);
  console.log(`  design: ${opts.design}`);
  console.log(`  out:    ${opts.out}`);
  console.log(`  Watching for changes...\n`);

  const designPath = path.resolve(opts.design);

  if (!(await fs.pathExists(designPath))) {
    console.log(`  Waiting for design file to appear at: ${designPath}`);
  }

  let lastModified = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function checkAndRun() {
    try {
      if (!(await fs.pathExists(designPath))) return;

      const stat = await fs.stat(designPath);
      const mtime = stat.mtimeMs;

      if (mtime <= lastModified) return;
      lastModified = mtime;

      console.log(`\n[${new Date().toLocaleTimeString()}] Design file changed, running pull...`);
      await pullCommand(opts);
      console.log(`[${new Date().toLocaleTimeString()}] Pull complete. Watching...\n`);
    } catch (err: any) {
      console.error(`  Error during pull: ${err.message}`);
    }
  }

  const watcher = fs.watch(path.dirname(designPath), (_eventType, filename) => {
    if (filename !== path.basename(designPath)) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkAndRun, 300);
  });

  await checkAndRun();

  const pollInterval = setInterval(async () => {
    try {
      if (!(await fs.pathExists(designPath))) return;
      const stat = await fs.stat(designPath);
      if (stat.mtimeMs > lastModified) {
        await checkAndRun();
      }
    } catch {}
  }, 5000);

  process.on("SIGINT", () => {
    console.log("\n[scalar-design-sync] watch stopped.");
    watcher.close();
    clearInterval(pollInterval);
    process.exit(0);
  });

  await new Promise(() => {});
}
