import { exportDesignAST } from "../export/ast-exporter";
import { syncToReact, validateSync, checkBridgeHealth } from "../sync/design-sync-client";
import { computeExportHash, hasDesignChanged } from "../sync/change-detector";
import { postToUI } from "../messaging/plugin-to-ui";
import { getState, updateState } from "../state/plugin-state";

export async function runSyncToReact(
  appName?: string,
  bridgeUrl?: string
): Promise<void> {
  const state = getState();
  const url = bridgeUrl || state.bridgeUrl;

  postToUI({ type: "status", message: "Checking dev bridge..." });

  const healthy = await checkBridgeHealth(url);
  if (!healthy) {
    postToUI({
      type: "sync-result",
      ok: false,
      message: `Dev bridge not reachable at ${url}. Start it with: npm run dev:bridge`,
    });
    return;
  }

  postToUI({ type: "status", message: "Exporting design..." });
  const { ast, diagnostics } = exportDesignAST(appName);

  const exportHash = computeExportHash(ast);
  if (!hasDesignChanged(exportHash, state.lastExportHash)) {
    postToUI({
      type: "sync-result",
      ok: true,
      message: "Design unchanged since last sync — skipped.",
      exportHash,
    });
    return;
  }

  postToUI({ type: "status", message: "Syncing to React..." });
  const result = await syncToReact(ast, url, state.bridgeAuthToken || undefined);

  updateState({
    lastExportHash: exportHash,
    lastSyncTimestamp: new Date().toISOString(),
  });

  const parts: string[] = [];
  if (result.ok) {
    parts.push(`Synced ${result.generatedFiles.length} files.`);
  } else {
    parts.push(`Sync failed: ${result.error || "Unknown error"}`);
  }
  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s).`);
  }
  if (diagnostics.length > 0) {
    parts.push(`${diagnostics.length} export diagnostic(s).`);
  }

  postToUI({
    type: "sync-result",
    ok: result.ok,
    message: parts.join(" "),
    generatedFiles: result.generatedFiles,
    warnings: result.warnings,
    exportHash,
  });
}

export async function runValidateSync(
  appName?: string,
  bridgeUrl?: string
): Promise<void> {
  const state = getState();
  const url = bridgeUrl || state.bridgeUrl;

  postToUI({ type: "status", message: "Checking dev bridge..." });

  const healthy = await checkBridgeHealth(url);
  if (!healthy) {
    postToUI({
      type: "validate-result",
      ok: false,
      message: `Dev bridge not reachable at ${url}. Start it with: npm run dev:bridge`,
    });
    return;
  }

  postToUI({ type: "status", message: "Exporting design for validation..." });
  const { ast } = exportDesignAST(appName);

  postToUI({ type: "status", message: "Validating..." });
  const result = await validateSync(ast, url, state.bridgeAuthToken || undefined);

  const msg = result.ok
    ? `Validation passed. ${result.warnings.length} warning(s).`
    : `Validation failed. ${result.errors.length} error(s), ${result.warnings.length} warning(s).`;

  postToUI({
    type: "validate-result",
    ok: result.ok,
    message: msg,
    errors: result.errors,
    warnings: result.warnings,
  });
}
