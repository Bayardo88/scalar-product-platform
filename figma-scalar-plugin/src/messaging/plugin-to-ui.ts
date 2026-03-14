export interface StatusMessage {
  type: "status";
  message: string;
}

export interface ExportedMessage {
  type: "exported";
  ast: string;
  message: string;
}

export interface SyncResultMessage {
  type: "sync-result";
  ok: boolean;
  message: string;
  generatedFiles?: string[];
  warnings?: string[];
  exportHash?: string;
}

export interface ValidateResultMessage {
  type: "validate-result";
  ok: boolean;
  message: string;
  errors?: string[];
  warnings?: string[];
}

export type PluginToUIMessage =
  | StatusMessage
  | ExportedMessage
  | SyncResultMessage
  | ValidateResultMessage;

export function postToUI(msg: PluginToUIMessage): void {
  figma.ui.postMessage(msg);
}
