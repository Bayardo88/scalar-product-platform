import {
  mergeGeneratedFile,
  wrapGenerated,
  computeChecksum,
  detectManualEdits,
} from "../src/sync/merge-engine";

describe("computeChecksum", () => {
  it("returns a 16-char hex string", () => {
    const hash = computeChecksum("hello world");
    expect(hash).toHaveLength(16);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
  });

  it("returns different checksums for different input", () => {
    const a = computeChecksum("hello");
    const b = computeChecksum("world");
    expect(a).not.toBe(b);
  });

  it("returns same checksum for same input", () => {
    const a = computeChecksum("same content");
    const b = computeChecksum("same content");
    expect(a).toBe(b);
  });
});

describe("wrapGenerated", () => {
  it("wraps content with start/end markers", () => {
    const wrapped = wrapGenerated("const x = 1;");
    expect(wrapped).toContain("// @scalar-generated-start");
    expect(wrapped).toContain("// @scalar-generated-end");
  });

  it("includes a checksum", () => {
    const wrapped = wrapGenerated("const x = 1;");
    expect(wrapped).toContain("// @scalar-checksum:");
  });

  it("includes manual edit placeholder", () => {
    const wrapped = wrapGenerated("const x = 1;");
    expect(wrapped).toContain("Add your manual code below this line");
  });
});

describe("mergeGeneratedFile", () => {
  it("creates a new file when no existing content", () => {
    const result = mergeGeneratedFile("const x = 1;", null);
    expect(result.strategy).toBe("new");
    expect(result.hasManualEdits).toBe(false);
    expect(result.generatedChanged).toBe(true);
    expect(result.content).toContain("const x = 1;");
  });

  it("returns unchanged when content is identical", () => {
    const initial = wrapGenerated("const x = 1;");
    const result = mergeGeneratedFile("const x = 1;", initial);
    expect(result.strategy).toBe("regenerated");
    expect(result.generatedChanged).toBe(false);
  });

  it("preserves manual edits when generated content changes", () => {
    const initial = wrapGenerated("const x = 1;");
    const withEdits =
      initial.replace(
        "// Add your manual code below this line",
        "// Add your manual code below this line\n\nfunction myHelper() { return 42; }"
      );

    const result = mergeGeneratedFile("const x = 2;", withEdits);
    expect(result.strategy).toBe("merged-preserved");
    expect(result.hasManualEdits).toBe(true);
    expect(result.content).toContain("const x = 2;");
    expect(result.content).toContain("myHelper");
  });

  it("overwrites non-wrapped files on conflict", () => {
    const result = mergeGeneratedFile(
      "const x = 2;",
      "const x = 1; // old file without markers"
    );
    expect(result.strategy).toBe("conflict-overwritten");
    expect(result.content).toContain("const x = 2;");
  });
});

describe("detectManualEdits", () => {
  it("returns false for files without manual edits", () => {
    const wrapped = wrapGenerated("const x = 1;");
    const result = detectManualEdits(wrapped);
    expect(result.hasEdits).toBe(false);
  });

  it("returns true for files with manual edits", () => {
    const wrapped = wrapGenerated("const x = 1;");
    const withEdits = wrapped.replace(
      "// Add your manual code below this line",
      "// Add your manual code below this line\n\nfunction custom() {}"
    );
    const result = detectManualEdits(withEdits);
    expect(result.hasEdits).toBe(true);
    expect(result.editedSections.length).toBeGreaterThan(0);
  });

  it("returns false for unwrapped content", () => {
    const result = detectManualEdits("const x = 1;");
    expect(result.hasEdits).toBe(false);
  });
});
