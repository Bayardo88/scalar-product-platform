import { exportDesignAST, ExportResult } from "../export/ast-exporter";
import { postToUI } from "../messaging/plugin-to-ui";

export async function runExport(appName?: string): Promise<ExportResult> {
  postToUI({ type: "status", message: "Exporting design..." });

  const result = exportDesignAST(appName);
  const { ast, diagnostics } = result;

  const diagMessages: string[] = [];
  if (diagnostics.length > 0) {
    const missingRole = diagnostics.filter((d) => d.issue === "missing-role").length;
    const missingId = diagnostics.filter((d) => d.issue === "missing-astId").length;
    if (missingRole > 0) diagMessages.push(`${missingRole} nodes missing role`);
    if (missingId > 0) diagMessages.push(`${missingId} nodes missing astId`);
  }

  const statusParts = [
    `Exported ${ast.screens.length} screens, ${ast.nodes.length} top-level nodes.`,
  ];
  if (diagMessages.length > 0) {
    statusParts.push(`Warnings: ${diagMessages.join(", ")}`);
  }

  postToUI({
    type: "exported",
    ast: JSON.stringify(ast, null, 2),
    message: statusParts.join(" "),
  });

  return result;
}
