export interface PluginState {
  lastPrompt: string | null;
  lastExportHash: string | null;
  lastSyncTimestamp: string | null;
  bridgeUrl: string;
  bridgeAuthToken: string | null;
  isProcessing: boolean;
}

const DEFAULT_BRIDGE_URL = "http://localhost:4311";

let state: PluginState = {
  lastPrompt: null,
  lastExportHash: null,
  lastSyncTimestamp: null,
  bridgeUrl: DEFAULT_BRIDGE_URL,
  bridgeAuthToken: null,
  isProcessing: false,
};

export function getState(): Readonly<PluginState> {
  return state;
}

export function updateState(patch: Partial<PluginState>): void {
  state = { ...state, ...patch };
}

export function resetState(): void {
  state = {
    lastPrompt: null,
    lastExportHash: null,
    lastSyncTimestamp: null,
    bridgeUrl: DEFAULT_BRIDGE_URL,
    bridgeAuthToken: null,
    isProcessing: false,
  };
}
