import fs from "fs-extra";
import path from "path";

export interface ParsedComponent {
  name: string;
  filePath: string;
  imports: ParsedImport[];
  usedComponents: string[];
  stateVariables: string[];
  dataBindings: string[];
  hasNavigate: boolean;
  hasSubmit: boolean;
  hasManualEdits: boolean;
  generatedChecksum: string | null;
}

export interface ParsedImport {
  names: string[];
  path: string;
}

export interface CodeDesignDiff {
  screenName: string;
  filePath: string;
  componentsMissingInCode: string[];
  componentsMissingInDesign: string[];
  dataBindingsMissingInCode: string[];
  dataBindingsMissingInDesign: string[];
  hasManualEdits: boolean;
  status: "in-sync" | "code-ahead" | "design-ahead" | "diverged";
}

const GENERATED_START = "// @scalar-generated-start";
const GENERATED_END = "// @scalar-generated-end";
const CHECKSUM_PREFIX = "// @scalar-checksum:";

function extractChecksum(content: string): string | null {
  const startIdx = content.indexOf(GENERATED_START);
  if (startIdx === -1) return null;

  const checksumLineStart = content.indexOf(CHECKSUM_PREFIX, startIdx);
  if (checksumLineStart === -1) return null;

  const lineEnd = content.indexOf("\n", checksumLineStart);
  return content
    .slice(checksumLineStart + CHECKSUM_PREFIX.length, lineEnd)
    .trim();
}

function hasManualEditsInFile(content: string): boolean {
  const endIdx = content.indexOf(GENERATED_END);
  if (endIdx === -1) return false;

  const afterEnd = content.slice(endIdx + GENERATED_END.length).trim();
  const cleaned = afterEnd
    .replace(/^\/\/ Add your manual code below this line\s*/, "")
    .trim();

  return cleaned.length > 0;
}

function extractImports(content: string): ParsedImport[] {
  const imports: ParsedImport[] = [];
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1]
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    imports.push({ names, path: match[2] });
  }

  return imports;
}

function extractUsedComponents(content: string): string[] {
  const components = new Set<string>();
  const tagRegex = /<([A-Z][A-Za-z0-9]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(content)) !== null) {
    if (match[1] !== "React") {
      components.add(match[1]);
    }
  }

  return [...components];
}

function extractStateVariables(content: string): string[] {
  const vars: string[] = [];
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
  let match: RegExpExecArray | null;

  while ((match = stateRegex.exec(content)) !== null) {
    vars.push(match[1]);
  }

  return vars;
}

function extractDataBindings(content: string): string[] {
  const bindings: string[] = [];
  const bindRegex = /data=\{(\w+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = bindRegex.exec(content)) !== null) {
    bindings.push(match[1]);
  }

  return bindings;
}

export function parseGeneratedFile(filePath: string, content: string): ParsedComponent {
  const nameMatch = content.match(
    /export\s+(?:default\s+)?function\s+(\w+)/
  );
  const name = nameMatch ? nameMatch[1] : path.basename(filePath, ".tsx");

  return {
    name,
    filePath,
    imports: extractImports(content),
    usedComponents: extractUsedComponents(content),
    stateVariables: extractStateVariables(content),
    dataBindings: extractDataBindings(content),
    hasNavigate: content.includes("useNavigate"),
    hasSubmit:
      content.includes("handleSubmit") || content.includes("onSubmit"),
    hasManualEdits: hasManualEditsInFile(content),
    generatedChecksum: extractChecksum(content),
  };
}

export async function scanGeneratedScreens(
  outDir: string
): Promise<ParsedComponent[]> {
  const screensDir = path.join(outDir, "src/screens/generated");
  if (!(await fs.pathExists(screensDir))) return [];

  const files = await fs.readdir(screensDir);
  const results: ParsedComponent[] = [];

  for (const file of files) {
    if (!file.endsWith(".generated.tsx")) continue;
    const filePath = path.join(screensDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    results.push(parseGeneratedFile(filePath, content));
  }

  return results;
}

export async function scanGeneratedComponents(
  outDir: string
): Promise<ParsedComponent[]> {
  const componentsDir = path.join(outDir, "src/components/generated");
  if (!(await fs.pathExists(componentsDir))) return [];

  const files = await fs.readdir(componentsDir);
  const results: ParsedComponent[] = [];

  for (const file of files) {
    if (!file.endsWith(".generated.tsx")) continue;
    const filePath = path.join(componentsDir, file);
    const content = await fs.readFile(filePath, "utf-8");
    results.push(parseGeneratedFile(filePath, content));
  }

  return results;
}
