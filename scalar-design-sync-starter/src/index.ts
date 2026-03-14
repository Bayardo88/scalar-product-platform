
import { Command } from "commander";
import { pullCommand } from "./pull";
import { validateCommand } from "./validate";

const program = new Command();

program.command("pull")
.requiredOption("--design <path>")
.requiredOption("--out <path>")
.action(pullCommand);

program.command("validate")
.requiredOption("--design <path>")
.action(validateCommand);

program.parse();
