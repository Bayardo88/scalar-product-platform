export interface GenerateMessage {
  type: "generate";
  prompt: string;
}

export interface ExportMessage {
  type: "export";
  appName?: string;
}

export interface HiFiSwapMessage {
  type: "hifi-swap";
  useLibrary?: boolean;
}

export interface SyncReactMessage {
  type: "sync-react";
  appName?: string;
  bridgeUrl?: string;
}

export interface ValidateSyncMessage {
  type: "validate-sync";
  appName?: string;
  bridgeUrl?: string;
}

export type UIToPluginMessage =
  | GenerateMessage
  | ExportMessage
  | HiFiSwapMessage
  | SyncReactMessage
  | ValidateSyncMessage;
