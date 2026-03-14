import { SaaSAppBrief } from "../types/brief";
import { parsePromptToBrief } from "./prompt-to-brief";
import { parsePromptWithAI, AIParserConfig, getDefaultAIConfig, isAIParserAvailable } from "./ai-prompt-parser";

export interface ParseOptions {
  mode?: "auto" | "ai" | "regex";
  aiConfig?: AIParserConfig;
  onFallback?: (reason: string) => void;
}

export async function parsePromptUnified(
  prompt: string,
  options: ParseOptions = {}
): Promise<SaaSAppBrief> {
  const mode = options.mode || "auto";

  if (mode === "regex") {
    return parsePromptToBrief(prompt);
  }

  if (mode === "ai" || mode === "auto") {
    const config = options.aiConfig || getDefaultAIConfig();

    if (!config) {
      if (mode === "ai") {
        throw new Error(
          "AI parser requested but no API key found. Set OPENAI_API_KEY or SCALAR_AI_API_KEY."
        );
      }
      options.onFallback?.("No API key configured, using regex parser");
      return parsePromptToBrief(prompt);
    }

    try {
      return await parsePromptWithAI(prompt, config);
    } catch (err) {
      if (mode === "ai") throw err;

      const reason = err instanceof Error ? err.message : String(err);
      options.onFallback?.(`AI parser failed (${reason}), using regex parser`);
      return parsePromptToBrief(prompt);
    }
  }

  return parsePromptToBrief(prompt);
}
