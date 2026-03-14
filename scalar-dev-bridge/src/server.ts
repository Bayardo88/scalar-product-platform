import express from "express";
import syncRouter from "./routes/sync";
import validateRouter from "./routes/validate";
import { authMiddleware, isAuthEnabled, getOrCreateToken } from "./middleware/auth";

const startTime = Date.now();

export function createServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(authMiddleware());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      authEnabled: isAuthEnabled(),
    });
  });

  app.use("/sync", syncRouter);
  app.use("/validate", validateRouter);

  return app;
}

export async function printStartupInfo(port: number): Promise<void> {
  console.log(`[scalar-dev-bridge] listening on http://localhost:${port}`);
  console.log(`  POST /sync      — sync design export to React scaffolds`);
  console.log(`  POST /validate  — validate design export`);
  console.log(`  GET  /health    — health check`);

  if (isAuthEnabled()) {
    const token = await getOrCreateToken();
    console.log(`\n  Auth: ENABLED`);
    console.log(`  Token: ${token}`);
    console.log(`  Set this in your Figma plugin or use:`);
    console.log(`    curl -H "Authorization: Bearer ${token}" ...`);
  } else {
    console.log(`\n  Auth: disabled (set SCALAR_BRIDGE_AUTH=true to enable)`);
  }

  console.log(`\nReady to receive design exports from the Figma plugin.`);
}
