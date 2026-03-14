
import { parsePromptToBrief, generateAstFromBrief } from "../src";

const brief = parsePromptToBrief("Create a project management SaaS with dashboard, projects, tasks and settings");
const ast = generateAstFromBrief(brief);

console.log(JSON.stringify(ast, null, 2));
