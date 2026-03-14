import { DesignAST } from "scalar-product-generator-core";

export type SyncPayload = DesignAST;

export interface SyncReport {
  ok: boolean;
  generatedFiles: string[];
  warnings: string[];
  exportHash: string;
  timestamp: string;
  updatedScreens: string[];
  unmappedRoles: string[];
}

export interface ValidateReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}
