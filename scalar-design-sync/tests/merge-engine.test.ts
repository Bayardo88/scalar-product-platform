import {
  mergeGeneratedFile,
  wrapGenerated,
  computeChecksum,
  detectManualEdits,
} from "../src/sync/merge-engine";

describe("merge-engine", () => {
  describe("computeChecksum", () => {
    it("should return a 16-char hex string", () => {
      const checksum = computeChecksum("hello world");
      expect(checksum).toMatch(/^[a-f0-9]{16}$/);
    });

    it("should be deterministic", () => {
      expect(computeChecksum("test")).toBe(computeChecksum("test"));
    });

    it("should differ for different content", () => {
      expect(computeChecksum("abc")).not.toBe(computeChecksum("xyz"));
    });
  });

  describe("wrapGenerated", () => {
    it("should wrap content with start/end markers", () => {
      const wrapped = wrapGenerated("const x = 1;");
      expect(wrapped).toContain("@scalar-generated-start");
      expect(wrapped).toContain("@scalar-generated-end");
    });

    it("should include a checksum line", () => {
      const wrapped = wrapGenerated("const x = 1;");
      expect(wrapped).toContain("@scalar-checksum:");
    });

    it("should include manual code placeholder", () => {
      const wrapped = wrapGenerated("const x = 1;");
      expect(wrapped).toContain("Add your manual code below this line");
    });

    it("should preserve imports before markers", () => {
      const code = 'import React from "react";\n\nexport function Foo() {}';
      const wrapped = wrapGenerated(code);
      const startIdx = wrapped.indexOf("@scalar-generated-start");
      const importIdx = wrapped.indexOf("import React");
      expect(importIdx).toBeLessThan(startIdx);
    });
  });

  describe("mergeGeneratedFile", () => {
    it("should return 'new' strategy for first generation", () => {
      const result = mergeGeneratedFile("const x = 1;", null);
      expect(result.strategy).toBe("new");
      expect(result.generatedChanged).toBe(true);
      expect(result.hasManualEdits).toBe(false);
    });

    it("should return 'regenerated' when content is unchanged", () => {
      const first = mergeGeneratedFile("const x = 1;", null);
      const second = mergeGeneratedFile("const x = 1;", first.content);
      expect(second.strategy).toBe("regenerated");
      expect(second.generatedChanged).toBe(false);
    });

    it("should return 'regenerated' when content changes but no manual edits", () => {
      const first = mergeGeneratedFile("const x = 1;", null);
      const second = mergeGeneratedFile("const x = 2;", first.content);
      expect(second.strategy).toBe("regenerated");
      expect(second.generatedChanged).toBe(true);
    });

    it("should return 'merged-preserved' when manual edits exist and generated changes", () => {
      const first = mergeGeneratedFile("const x = 1;", null);
      const withManual = first.content.replace(
        "// Add your manual code below this line",
        "// Add your manual code below this line\n\nconst myCode = 42;"
      );
      const result = mergeGeneratedFile("const x = 2;", withManual);
      expect(result.strategy).toBe("merged-preserved");
      expect(result.hasManualEdits).toBe(true);
      expect(result.content).toContain("myCode = 42");
      expect(result.content).toContain("const x = 2;");
    });

    it("should handle files without markers (plain overwrite)", () => {
      const result = mergeGeneratedFile("const y = 2;", "const x = 1;");
      expect(result.strategy).toBe("conflict-overwritten");
    });
  });

  describe("detectManualEdits", () => {
    it("should detect no edits in fresh file", () => {
      const wrapped = wrapGenerated("const x = 1;");
      const result = detectManualEdits(wrapped);
      expect(result.hasEdits).toBe(false);
    });

    it("should detect manual edits after marker", () => {
      const wrapped = wrapGenerated("const x = 1;");
      const withEdits = wrapped.replace(
        "// Add your manual code below this line",
        "// Add your manual code below this line\n\nfunction helperFn() { return 1; }"
      );
      const result = detectManualEdits(withEdits);
      expect(result.hasEdits).toBe(true);
      expect(result.editedSections.length).toBeGreaterThan(0);
    });

    it("should return false for non-wrapped files", () => {
      const result = detectManualEdits("const x = 1;");
      expect(result.hasEdits).toBe(false);
    });
  });
});
