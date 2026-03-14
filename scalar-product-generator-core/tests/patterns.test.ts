import { scalarPatterns, getPattern } from "../src";

describe("scalarPatterns", () => {
  it("should contain all 8 required patterns", () => {
    const ids = scalarPatterns.map((p) => p.id);
    expect(ids).toContain("pattern.appShell.sidebarTopbar");
    expect(ids).toContain("pattern.dashboard.standard");
    expect(ids).toContain("pattern.entity.list");
    expect(ids).toContain("pattern.entity.detail");
    expect(ids).toContain("pattern.entity.formModal");
    expect(ids).toContain("pattern.auth.login");
    expect(ids).toContain("pattern.analytics.overview");
    expect(ids).toContain("pattern.settings.standard");
  });

  it("should have valid categories", () => {
    const validCategories = ["layout", "screen", "overlay", "state"];
    for (const pattern of scalarPatterns) {
      expect(validCategories).toContain(pattern.category);
    }
  });

  it("should have descriptions for all patterns", () => {
    for (const pattern of scalarPatterns) {
      expect(pattern.description).toBeTruthy();
    }
  });

  it("should be findable by getPattern()", () => {
    const appShell = getPattern("pattern.appShell.sidebarTopbar");
    expect(appShell).toBeDefined();
    expect(appShell!.rootRole).toBe("appShell");

    const missing = getPattern("pattern.nonexistent");
    expect(missing).toBeUndefined();
  });

  it("dashboard pattern should extend appShell", () => {
    const dashboard = getPattern("pattern.dashboard.standard");
    expect(dashboard!.extends).toBe("pattern.appShell.sidebarTopbar");
  });

  it("formModal should be an overlay category", () => {
    const formModal = getPattern("pattern.entity.formModal");
    expect(formModal!.category).toBe("overlay");
    expect(formModal!.rootRole).toBe("overlay.modal");
  });
});
