import { Router, Request, Response } from "express";
import { runPull, computeExportHash } from "../services/run-pull";
import { SyncPayload } from "../types/sync-payload";

const router = Router();

let lastExportHash: string | null = null;

router.post("/", async (req: Request, res: Response) => {
  try {
    const payload = req.body as SyncPayload;

    if (!payload || !payload.screens || !payload.nodes) {
      res.status(400).json({
        ok: false,
        error: "Invalid payload: expected a DesignAST with screens and nodes",
        generatedFiles: [],
        warnings: [],
        exportHash: "",
      });
      return;
    }

    const exportHash = computeExportHash(payload);

    if (exportHash === lastExportHash) {
      res.json({
        ok: true,
        generatedFiles: [],
        warnings: ["Design unchanged since last sync — skipped."],
        exportHash,
      });
      return;
    }

    const outDir = process.env.SCALAR_OUTPUT_DIR || undefined;
    const report = await runPull(payload, outDir);

    lastExportHash = exportHash;

    res.json({
      ok: report.ok,
      generatedFiles: report.generatedFiles,
      warnings: report.warnings,
      exportHash: report.exportHash,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message || String(err),
      generatedFiles: [],
      warnings: [],
      exportHash: "",
    });
  }
});

export default router;
