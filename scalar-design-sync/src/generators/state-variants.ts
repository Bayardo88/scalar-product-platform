import { ASTNode } from "scalar-product-generator-core";

export interface StateVariantConfig {
  hasDataBinding: boolean;
  bindingName: string;
  varName: string;
  entityName: string;
  roles: Set<string>;
}

const DATA_DRIVEN_ROLES = new Set([
  "table.data",
  "collection.cards",
  "feed.activity",
  "chart.analytics",
  "chart.bar",
  "chart.line",
  "chart.pie",
  "panel.details",
]);

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function collectStateVariants(rootNode: ASTNode): StateVariantConfig[] {
  const variants: StateVariantConfig[] = [];
  const seen = new Set<string>();

  function walk(node: ASTNode) {
    if (node.data?.bind && DATA_DRIVEN_ROLES.has(node.role) && !seen.has(node.data.bind)) {
      seen.add(node.data.bind);
      variants.push({
        hasDataBinding: true,
        bindingName: node.data.bind,
        varName: toCamelCase(node.data.bind),
        entityName: node.data.entity || toPascalCase(node.data.bind),
        roles: new Set([node.role]),
      });
    } else if (node.data?.bind && seen.has(node.data.bind)) {
      const existing = variants.find((v) => v.bindingName === node.data!.bind);
      if (existing) existing.roles.add(node.role);
    }

    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }

  walk(rootNode);
  return variants;
}

export function generateLoadingState(varName: string): string {
  return [
    `  const [${varName}Loading, set${toPascalCase(varName)}Loading] = useState(true);`,
    `  const [${varName}Error, set${toPascalCase(varName)}Error] = useState<string | null>(null);`,
  ].join("\n");
}

export function generateFetchEffect(
  varName: string,
  entityName: string
): string {
  const setLoading = `set${toPascalCase(varName)}Loading`;
  const setError = `set${toPascalCase(varName)}Error`;
  const setData = `set${toPascalCase(varName)}`;

  return [
    `  useEffect(() => {`,
    `    let cancelled = false;`,
    `    ${setLoading}(true);`,
    `    fetch${entityName}()`,
    `      .then((data) => {`,
    `        if (!cancelled) {`,
    `          ${setData}(data);`,
    `          ${setLoading}(false);`,
    `        }`,
    `      })`,
    `      .catch((err) => {`,
    `        if (!cancelled) {`,
    `          ${setError}(err.message || "Failed to load ${varName}");`,
    `          ${setLoading}(false);`,
    `        }`,
    `      });`,
    `    return () => { cancelled = true; };`,
    `  }, []);`,
  ].join("\n");
}

export function generateLoadingWrapper(
  varName: string,
  content: string,
  indent: number
): string {
  const pad = "  ".repeat(indent);
  const loadingVar = `${varName}Loading`;
  const errorVar = `${varName}Error`;

  return [
    `${pad}{${loadingVar} ? (`,
    `${pad}  <div className="scalar-loading" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32, color: "#888" }}>`,
    `${pad}    Loading ${varName}...`,
    `${pad}  </div>`,
    `${pad}) : ${errorVar} ? (`,
    `${pad}  <div className="scalar-error" style={{ padding: 16, color: "#dc2626", background: "#fef2f2", borderRadius: 8 }}>`,
    `${pad}    {${errorVar}}`,
    `${pad}  </div>`,
    `${pad}) : ${varName}.length === 0 ? (`,
    `${pad}  <div className="scalar-empty" style={{ padding: 32, textAlign: "center", color: "#888" }}>`,
    `${pad}    No ${varName} found.`,
    `${pad}  </div>`,
    `${pad}) : (`,
    content,
    `${pad})}`,
  ].join("\n");
}

export function generateDataServiceStubs(
  variants: StateVariantConfig[]
): string {
  const lines: string[] = [];

  for (const v of variants) {
    lines.push(
      `async function fetch${v.entityName}(): Promise<any[]> {`
    );
    lines.push(
      `  // TODO: replace with real API call for ${v.entityName}`
    );
    lines.push(`  return [];`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join("\n");
}
