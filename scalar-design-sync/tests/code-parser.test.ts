import { parseGeneratedFile } from "../src/sync/code-parser";

describe("parseGeneratedFile", () => {
  it("extracts component name from default export", () => {
    const content = `
import React from "react";
export default function DashboardGenerated() {
  return <div>Dashboard</div>;
}
`;
    const result = parseGeneratedFile("Dashboard.generated.tsx", content);
    expect(result.name).toBe("DashboardGenerated");
  });

  it("extracts imports", () => {
    const content = `
import React, { useState } from "react";
import { Button } from "@scalar/ui/Button";
import { DataTable } from "@scalar/ui/DataTable";

export default function TestGenerated() {
  return <div />;
}
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.imports).toHaveLength(2);
    expect(result.imports[0].names).toContain("Button");
    expect(result.imports[0].path).toBe("@scalar/ui/Button");
  });

  it("extracts used components from JSX", () => {
    const content = `
import React from "react";
export default function TestGenerated() {
  return (
    <div>
      <Button>Click</Button>
      <DataTable data={[]} />
      <SummaryCard label="test" value={42} />
    </div>
  );
}
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.usedComponents).toContain("Button");
    expect(result.usedComponents).toContain("DataTable");
    expect(result.usedComponents).toContain("SummaryCard");
  });

  it("extracts state variables", () => {
    const content = `
import React, { useState } from "react";
export default function TestGenerated() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  return <div />;
}
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.stateVariables).toContain("items");
    expect(result.stateVariables).toContain("loading");
  });

  it("extracts data bindings", () => {
    const content = `
import React from "react";
export default function TestGenerated() {
  return <DataTable data={projects} />;
}
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.dataBindings).toContain("projects");
  });

  it("detects useNavigate", () => {
    const content = `
import { useNavigate } from "react-router-dom";
export default function TestGenerated() {
  const navigate = useNavigate();
  return <div />;
}
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.hasNavigate).toBe(true);
  });

  it("detects manual edits via markers", () => {
    const content = `
import React from "react";

// @scalar-generated-start
// @scalar-checksum:abc123
export default function TestGenerated() {
  return <div />;
}
// @scalar-generated-end

// Add your manual code below this line

function myCustomHelper() { return 42; }
`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.hasManualEdits).toBe(true);
    expect(result.generatedChecksum).toBe("abc123");
  });

  it("detects no manual edits when section is empty", () => {
    const content = `
import React from "react";

// @scalar-generated-start
// @scalar-checksum:abc123
export default function TestGenerated() {
  return <div />;
}
// @scalar-generated-end

// Add your manual code below this line

`;
    const result = parseGeneratedFile("Test.generated.tsx", content);
    expect(result.hasManualEdits).toBe(false);
  });
});
