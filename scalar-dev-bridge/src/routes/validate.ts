import { Router, Request, Response } from "express";
import { runValidate } from "../services/run-validate";
import { SyncPayload } from "../types/sync-payload";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const payload = req.body as SyncPayload;

    if (!payload || !payload.screens || !payload.nodes) {
      res.status(400).json({
        ok: false,
        errors: ["Invalid payload: expected a DesignAST with screens and nodes"],
        warnings: [],
      });
      return;
    }

    const report = await runValidate(payload);

    res.json({
      ok: report.ok,
      errors: report.errors,
      warnings: report.warnings,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      errors: [err.message || String(err)],
      warnings: [],
    });
  }
});

export default router;
