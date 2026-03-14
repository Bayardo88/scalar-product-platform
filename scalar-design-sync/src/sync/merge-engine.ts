import crypto from "crypto";

const GENERATED_START = "// @scalar-generated-start";
const GENERATED_END = "// @scalar-generated-end";
const CHECKSUM_PREFIX = "// @scalar-checksum:";

export function computeChecksum(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

export function wrapGenerated(content: string): string {
  const checksum = computeChecksum(content);
  const lines = content.split("\n");

  const importLines: string[] = [];
  const restLines: string[] = [];
  let pastImports = false;

  for (const line of lines) {
    if (!pastImports && (line.startsWith("import ") || line.startsWith("// import ") || line.trim() === "")) {
      importLines.push(line);
    } else {
      pastImports = true;
      restLines.push(line);
    }
  }

  return [
    ...importLines,
    "",
    `${GENERATED_START}`,
    `${CHECKSUM_PREFIX}${checksum}`,
    ...restLines,
    `${GENERATED_END}`,
    "",
    "// Add your manual code below this line",
    "",
  ].join("\n");
}

interface ParsedFile {
  imports: string;
  generatedBlock: string;
  generatedChecksum: string | null;
  manualBlock: string;
}

function parseWrappedFile(content: string): ParsedFile | null {
  const startIdx = content.indexOf(GENERATED_START);
  const endIdx = content.indexOf(GENERATED_END);

  if (startIdx === -1 || endIdx === -1) return null;

  const imports = content.slice(0, startIdx).trimEnd();
  const generatedWithMeta = content.slice(startIdx + GENERATED_START.length, endIdx).trim();

  let generatedChecksum: string | null = null;
  let generatedBlock: string;

  if (generatedWithMeta.startsWith(CHECKSUM_PREFIX)) {
    const firstNewline = generatedWithMeta.indexOf("\n");
    generatedChecksum = generatedWithMeta.slice(CHECKSUM_PREFIX.length, firstNewline).trim();
    generatedBlock = generatedWithMeta.slice(firstNewline + 1);
  } else {
    generatedBlock = generatedWithMeta;
  }

  const manualBlock = content.slice(endIdx + GENERATED_END.length).trim();

  return { imports, generatedBlock, generatedChecksum, manualBlock };
}

export interface MergeResult {
  content: string;
  strategy: "new" | "regenerated" | "merged-preserved" | "conflict-overwritten";
  hasManualEdits: boolean;
  generatedChanged: boolean;
}

export function mergeGeneratedFile(
  newGenerated: string,
  existingContent: string | null
): MergeResult {
  if (!existingContent) {
    return {
      content: wrapGenerated(newGenerated),
      strategy: "new",
      hasManualEdits: false,
      generatedChanged: true,
    };
  }

  const parsed = parseWrappedFile(existingContent);

  if (!parsed) {
    const existingChecksum = computeChecksum(existingContent);
    const newChecksum = computeChecksum(newGenerated);

    if (existingChecksum === newChecksum) {
      return {
        content: existingContent,
        strategy: "regenerated",
        hasManualEdits: false,
        generatedChanged: false,
      };
    }

    return {
      content: wrapGenerated(newGenerated),
      strategy: "conflict-overwritten",
      hasManualEdits: true,
      generatedChanged: true,
    };
  }

  const newWrapped = wrapGenerated(newGenerated);
  const newParsed = parseWrappedFile(newWrapped);
  const newChecksum = newParsed?.generatedChecksum || computeChecksum(newGenerated);
  const generatedChanged = parsed.generatedChecksum !== newChecksum;

  const hasManualEdits =
    parsed.manualBlock.length > 0 &&
    parsed.manualBlock !== "// Add your manual code below this line" &&
    parsed.manualBlock.trim() !== "";

  const cleanManual = parsed.manualBlock
    .replace(/^\/\/ Add your manual code below this line\s*/, "")
    .trim();

  if (!generatedChanged) {
    return {
      content: existingContent,
      strategy: "regenerated",
      hasManualEdits,
      generatedChanged: false,
    };
  }

  const mergedLines = newWrapped.split("\n");
  const endMarkerIdx = mergedLines.findIndex((l) => l.includes(GENERATED_END));

  if (hasManualEdits && cleanManual && endMarkerIdx !== -1) {
    const afterEnd = mergedLines.slice(endMarkerIdx + 1);
    const manualSectionStart = afterEnd.findIndex((l) =>
      l.includes("Add your manual code below this line")
    );

    const insertIdx = endMarkerIdx + 1 + (manualSectionStart !== -1 ? manualSectionStart + 1 : 1);

    mergedLines.splice(insertIdx + 1, 0, "", cleanManual);

    return {
      content: mergedLines.join("\n"),
      strategy: "merged-preserved",
      hasManualEdits: true,
      generatedChanged: true,
    };
  }

  return {
    content: newWrapped,
    strategy: "regenerated",
    hasManualEdits: false,
    generatedChanged: true,
  };
}

export function detectManualEdits(content: string): {
  hasEdits: boolean;
  editedSections: string[];
} {
  const parsed = parseWrappedFile(content);

  if (!parsed) {
    return { hasEdits: false, editedSections: [] };
  }

  const cleanManual = parsed.manualBlock
    .replace(/^\/\/ Add your manual code below this line\s*/, "")
    .trim();

  if (!cleanManual) {
    return { hasEdits: false, editedSections: [] };
  }

  const sections: string[] = [];
  const lines = cleanManual.split("\n");
  let currentSection = "";

  for (const line of lines) {
    if (line.match(/^(export\s+)?(function|const|class|interface|type)\s/)) {
      if (currentSection.trim()) sections.push(currentSection.trim());
      currentSection = line;
    } else {
      currentSection += "\n" + line;
    }
  }
  if (currentSection.trim()) sections.push(currentSection.trim());

  return { hasEdits: true, editedSections: sections };
}
