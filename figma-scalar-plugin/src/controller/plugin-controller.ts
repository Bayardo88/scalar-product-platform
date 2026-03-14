import { UIToPluginMessage } from "../messaging/ui-to-plugin";
import { postToUI } from "../messaging/plugin-to-ui";
import { updateState } from "../state/plugin-state";
import { runGenerate } from "../services/generate-service";
import { runExport } from "../services/export-service";
import { runHiFiUpgrade } from "../services/hifi-upgrade-service";
import { runSyncToReact, runValidateSync } from "../services/sync-service";

export async function handleMessage(msg: UIToPluginMessage): Promise<void> {
  updateState({ isProcessing: true });

  try {
    switch (msg.type) {
      case "generate": {
        const result = await runGenerate(msg.prompt);
        postToUI({
          type: "status",
          message: `Done! Rendered ${result.screenCount} screens, ${result.routeCount} routes, ${result.nodeCount} nodes.`,
        });
        break;
      }

      case "export": {
        await runExport(msg.appName);
        break;
      }

      case "hifi-swap": {
        const useLibrary = msg.useLibrary !== false;
        const modeLabel = useLibrary ? "library components + styles" : "styles only";
        postToUI({
          type: "status",
          message: `Applying hi-fi DS/Scalar (${modeLabel})...`,
        });

        const selection = figma.currentPage.selection;
        const scope = selection.length > 0 ? [...selection] : undefined;
        const stats = await runHiFiUpgrade(useLibrary, scope);

        const parts = [`${stats.swapped}/${stats.visited} nodes updated`];
        if (stats.componentSwaps > 0) {
          parts.push(`${stats.componentSwaps} swapped to library components`);
        }
        if (stats.libraryResolved > 0) {
          parts.push(`${stats.libraryResolved}/${stats.libraryTotal} library keys resolved`);
        }
        postToUI({
          type: "status",
          message: `Hi-fi swap complete! ${parts.join(", ")}.`,
        });
        break;
      }

      case "sync-react": {
        await runSyncToReact(msg.appName, msg.bridgeUrl);
        break;
      }

      case "validate-sync": {
        await runValidateSync(msg.appName, msg.bridgeUrl);
        break;
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    postToUI({ type: "status", message: `Error: ${message}` });
  } finally {
    updateState({ isProcessing: false });
  }
}
