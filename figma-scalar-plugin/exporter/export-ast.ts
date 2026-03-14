import { DesignAST, ASTScreen, ASTRoute, ASTNode } from "scalar-product-generator-core";
import { extractASTNode, resetExportIdCounter } from "./extract-node";
import { hasScalarMetadata } from "./extract-metadata";

function inferRouteFromScreenName(name: string): string {
  const slug = name
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "");

  if (slug.includes("login") || slug.includes("signin")) return "/login";
  if (slug.includes("dashboard")) return "/dashboard";
  if (slug.includes("analytics")) return "/analytics";
  if (slug.includes("settings")) return "/settings";

  if (slug.includes("detail")) {
    const base = slug.replace(/-?detail/, "");
    return `/${base || "item"}/:id`;
  }
  if (slug.includes("list")) {
    const base = slug.replace(/-?list/, "");
    return `/${base || "items"}`;
  }

  return `/${slug}`;
}

function collectTopLevelASTNodes(nodes: ASTNode[], out: ASTNode[]): void {
  out.push(...nodes);
}

export function exportDesignAST(appName?: string): DesignAST {
  resetExportIdCounter();

  const page = figma.currentPage;
  const screens: ASTScreen[] = [];
  const routes: ASTRoute[] = [];
  const nodes: ASTNode[] = [];

  let screenCounter = 1;
  let routeCounter = 1;

  for (const child of page.children) {
    if (!child.visible) continue;

    const isScreen =
      child.name.startsWith("Screen:") ||
      hasScalarMetadata(child) ||
      child.type === "FRAME";

    if (!isScreen) continue;

    const astNode = extractASTNode(child);
    nodes.push(astNode);

    const screenName = child.name.replace(/^Screen:\s*/, "");
    const screenId = `screen_${screenCounter++}`;

    screens.push({
      id: screenId,
      name: screenName,
      rootNodeId: astNode.id,
    });

    const path = inferRouteFromScreenName(screenName);
    const isAppShell = astNode.role === "appShell";

    routes.push({
      id: `route_${routeCounter++}`,
      path,
      screenId,
      ...(isAppShell ? { layout: "appShell" } : {}),
    });
  }

  return {
    version: "1.0",
    meta: {
      appName: appName || page.name || "Exported Design",
      designSystem: "DS/Scalar",
      mode: "lowfi",
      generatedAt: new Date().toISOString(),
    },
    routes,
    screens,
    nodes,
  };
}
