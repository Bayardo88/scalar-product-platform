import { DesignAST } from "scalar-product-generator-core";

const DEFAULT_BRIDGE_URL = "http://localhost:4311";

export interface SyncResponse {
  ok: boolean;
  generatedFiles: string[];
  warnings: string[];
  exportHash: string;
  error?: string;
}

export interface ValidateResponse {
  ok: boolean;
  errors: string[];
  warnings: string[];
  error?: string;
}

export interface HealthResponse {
  status: string;
  uptime: number;
  authEnabled?: boolean;
}

function buildHeaders(authToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

export async function syncToReact(
  ast: DesignAST,
  bridgeUrl: string = DEFAULT_BRIDGE_URL,
  authToken?: string
): Promise<SyncResponse> {
  const res = await fetch(`${bridgeUrl}/sync`, {
    method: "POST",
    headers: buildHeaders(authToken),
    body: JSON.stringify(ast),
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      generatedFiles: [],
      warnings: [],
      exportHash: "",
      error: `Bridge returned ${res.status}: ${text}`,
    };
  }

  return (await res.json()) as SyncResponse;
}

export async function validateSync(
  ast: DesignAST,
  bridgeUrl: string = DEFAULT_BRIDGE_URL,
  authToken?: string
): Promise<ValidateResponse> {
  const res = await fetch(`${bridgeUrl}/validate`, {
    method: "POST",
    headers: buildHeaders(authToken),
    body: JSON.stringify(ast),
  });

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      errors: [`Bridge returned ${res.status}: ${text}`],
      warnings: [],
      error: `Bridge returned ${res.status}: ${text}`,
    };
  }

  return (await res.json()) as ValidateResponse;
}

export async function checkBridgeHealth(
  bridgeUrl: string = DEFAULT_BRIDGE_URL
): Promise<boolean> {
  try {
    const res = await fetch(`${bridgeUrl}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
