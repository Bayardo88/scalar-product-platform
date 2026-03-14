import { handleMessage } from "./src/controller/plugin-controller";
import { UIToPluginMessage } from "./src/messaging/ui-to-plugin";

figma.showUI(__html__, { width: 420, height: 700 });

figma.ui.onmessage = (msg: UIToPluginMessage) => {
  handleMessage(msg);
};
