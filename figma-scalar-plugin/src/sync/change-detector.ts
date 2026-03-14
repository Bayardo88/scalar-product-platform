import { DesignAST } from "scalar-product-generator-core";

export function computeExportHash(ast: DesignAST): string {
  const payload = JSON.stringify({
    screens: ast.screens,
    routes: ast.routes,
    nodes: ast.nodes,
  });

  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function hasDesignChanged(
  currentHash: string,
  lastHash: string | null
): boolean {
  if (!lastHash) return true;
  return currentHash !== lastHash;
}
