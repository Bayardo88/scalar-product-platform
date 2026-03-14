#!/usr/bin/env node

import { Command } from "commander";
import { pullCommand } from "./commands/pull";
import { validateCommand } from "./commands/validate";
import { reportCommand } from "./commands/report";
import { diffCommand } from "./commands/diff";
import { watchCommand } from "./commands/watch";
import { codeDiffCommand } from "./commands/code-diff";

const program = new Command();

program
  .name("scalar-design-sync")
  .description("Sync Figma design exports into React scaffolds via the Scalar Design AST")
  .version("0.1.0");

program
  .command("pull")
  .description("Read design export JSON and generate React scaffold files")
  .requiredOption("--design <path>", "Path to design export JSON")
  .requiredOption("--out <path>", "Output directory for generated files")
  .option("--registry <path>", "Path to component registry JSON")
  .action(async (opts) => { await pullCommand(opts); });

program
  .command("validate")
  .description("Validate a design export for integrity and completeness")
  .requiredOption("--design <path>", "Path to design export JSON")
  .option("--registry <path>", "Path to component registry JSON")
  .action(validateCommand);

program
  .command("report")
  .description("Generate a coverage report of roles and mappings")
  .requiredOption("--design <path>", "Path to design export JSON")
  .option("--registry <path>", "Path to component registry JSON")
  .option("--out <path>", "Output directory for reports")
  .action(reportCommand);

program
  .command("diff")
  .description("Compare two design exports and show what changed")
  .requiredOption("--old <path>", "Path to the previous design export JSON")
  .requiredOption("--new <path>", "Path to the new design export JSON")
  .option("--out <path>", "Output directory for diff report")
  .action(diffCommand);

program
  .command("watch")
  .description("Watch a design export file and rerun pull when it changes")
  .requiredOption("--design <path>", "Path to design export JSON to watch")
  .requiredOption("--out <path>", "Output directory for generated files")
  .option("--registry <path>", "Path to component registry JSON")
  .action(watchCommand);

program
  .command("code-diff")
  .description("Compare generated code against a design export to find drift")
  .requiredOption("--design <path>", "Path to design export JSON")
  .requiredOption("--out <path>", "Output directory containing generated code")
  .option("--registry <path>", "Path to component registry JSON")
  .action(codeDiffCommand);

program.parse();
