import { ASTNode } from "scalar-product-generator-core";
import { RegistryEntry } from "./screens";

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

interface ComponentOutput {
  filename: string;
  content: string;
  role: string;
}

function generateFormComponent(node: ASTNode, _registry: RegistryEntry[]): ComponentOutput | null {
  const componentName = toPascalCase(node.name) + "Generated";
  const filename = `${componentName}.generated.tsx`;

  const fieldNodes = (node.children || []).filter(
    (c) => c.role.startsWith("input.") || c.role.startsWith("select.")
  );

  const stateFields = fieldNodes.map((f) => {
    const fieldName = f.name.toLowerCase().replace(/\s+/g, "");
    const isPassword = f.role === "input.password";
    return { fieldName, label: f.name, isPassword, placeholder: (f.props?.placeholder as string) || f.name };
  });

  const lines: string[] = [
    `import React, { useState, useCallback } from "react";`,
    ``,
    `interface ${componentName}Props {`,
    `  onSubmit?: (data: Record<string, string>) => void;`,
    `}`,
    ``,
    `export function ${componentName}({ onSubmit }: ${componentName}Props) {`,
  ];

  for (const field of stateFields) {
    lines.push(`  const [${field.fieldName}, set${toPascalCase(field.fieldName)}] = useState("");`);
  }

  lines.push(``);
  lines.push(`  const handleSubmit = useCallback((e: React.FormEvent) => {`);
  lines.push(`    e.preventDefault();`);
  lines.push(`    onSubmit?.({`);
  for (const field of stateFields) {
    lines.push(`      ${field.fieldName},`);
  }
  lines.push(`    });`);
  lines.push(`  }, [${stateFields.map((f) => f.fieldName).join(", ")}, onSubmit]);`);
  lines.push(``);
  lines.push(`  return (`);
  lines.push(`    <form onSubmit={handleSubmit} className="scalar-form-${node.role.split(".").pop()}">`);
  for (const field of stateFields) {
    lines.push(`      <div className="scalar-form-field">`);
    lines.push(`        <label htmlFor="${field.fieldName}">${field.label}</label>`);
    lines.push(
      `        <input` +
      `\n          id="${field.fieldName}"` +
      `\n          type="${field.isPassword ? "password" : "text"}"` +
      `\n          placeholder="${field.placeholder}"` +
      `\n          value={${field.fieldName}}` +
      `\n          onChange={(e) => set${toPascalCase(field.fieldName)}(e.target.value)}` +
      `\n        />`
    );
    lines.push(`      </div>`);
  }
  lines.push(`      <button type="submit">Submit</button>`);
  lines.push(`    </form>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);

  return { filename, content: lines.join("\n"), role: node.role };
}

function generateTableComponent(node: ASTNode, _registry: RegistryEntry[]): ComponentOutput | null {
  const componentName = toPascalCase(node.name) + "Generated";
  const filename = `${componentName}.generated.tsx`;
  const bindName = node.data?.bind || "items";

  const lines: string[] = [
    `import React from "react";`,
    ``,
    `interface ${componentName}Props {`,
    `  data: Record<string, unknown>[];`,
    `  onRowClick?: (item: Record<string, unknown>) => void;`,
    `}`,
    ``,
    `export function ${componentName}({ data, onRowClick }: ${componentName}Props) {`,
    `  if (!data || data.length === 0) {`,
    `    return <div className="scalar-empty">No ${bindName} found.</div>;`,
    `  }`,
    ``,
    `  const columns = Object.keys(data[0]);`,
    ``,
    `  return (`,
    `    <table className="scalar-table-data">`,
    `      <thead>`,
    `        <tr>`,
    `          {columns.map((col) => (`,
    `            <th key={col}>{col}</th>`,
    `          ))}`,
    `        </tr>`,
    `      </thead>`,
    `      <tbody>`,
    `        {data.map((row, idx) => (`,
    `          <tr key={idx} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : undefined }}>`,
    `            {columns.map((col) => (`,
    `              <td key={col}>{String(row[col] ?? "")}</td>`,
    `            ))}`,
    `          </tr>`,
    `        ))}`,
    `      </tbody>`,
    `    </table>`,
    `  );`,
    `}`,
    ``,
  ];

  return { filename, content: lines.join("\n"), role: node.role };
}

function generateCardGridComponent(node: ASTNode, _registry: RegistryEntry[]): ComponentOutput | null {
  const componentName = toPascalCase(node.name) + "Generated";
  const filename = `${componentName}.generated.tsx`;
  const bindName = node.data?.bind || "items";

  const lines: string[] = [
    `import React from "react";`,
    ``,
    `interface CardItem {`,
    `  id: string;`,
    `  label: string;`,
    `  value: string | number;`,
    `}`,
    ``,
    `interface ${componentName}Props {`,
    `  data: CardItem[];`,
    `}`,
    ``,
    `export function ${componentName}({ data }: ${componentName}Props) {`,
    `  return (`,
    `    <div className="scalar-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>`,
    `      {data.map((item) => (`,
    `        <div key={item.id} className="scalar-card-summary" style={{ padding: 16, borderRadius: 12, border: "1px solid #e5e5e5", background: "#fff" }}>`,
    `          <div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>`,
    `          <div style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{item.value}</div>`,
    `        </div>`,
    `      ))}`,
    `    </div>`,
    `  );`,
    `}`,
    ``,
  ];

  return { filename, content: lines.join("\n"), role: node.role };
}

export function generateComponentFiles(
  nodes: ASTNode[],
  registry: RegistryEntry[]
): ComponentOutput[] {
  const outputs: ComponentOutput[] = [];
  const processed = new Set<string>();

  function walk(node: ASTNode) {
    if (node.role.startsWith("form.") && !processed.has(node.role)) {
      processed.add(node.role);
      const out = generateFormComponent(node, registry);
      if (out) outputs.push(out);
    }

    if (node.role === "table.data" && !processed.has(`table-${node.name}`)) {
      processed.add(`table-${node.name}`);
      const out = generateTableComponent(node, registry);
      if (out) outputs.push(out);
    }

    if (node.role === "collection.cards" && !processed.has(`cards-${node.name}`)) {
      processed.add(`cards-${node.name}`);
      const out = generateCardGridComponent(node, registry);
      if (out) outputs.push(out);
    }

    if (node.children) {
      for (const child of node.children) walk(child);
    }
  }

  for (const node of nodes) walk(node);
  return outputs;
}
