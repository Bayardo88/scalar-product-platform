import { SaaSAppBrief } from "../types/brief";
import { parsePromptToBrief } from "./prompt-to-brief";

function getApiKey(): string | undefined {
  try {
    return process.env.OPENAI_API_KEY;
  } catch {
    return undefined;
  }
}

async function runAIParsing(prompt: string, apiKey: string): Promise<SaaSAppBrief> {
  const OpenAI = (await import("openai")).default;
  const { zodResponseFormat } = await import("openai/helpers/zod");
  const { SaaSBriefSchema } = await import("../schema/saasBrief.schema");

  const SYSTEM_PROMPT = `You are a senior SaaS product architect.

Convert the user prompt into a SaaS App Brief JSON.

Rules:

Return JSON only
Follow the schema strictly
Design system must be DS/Scalar
Frontend must be React
Prefer sidebar navigation
Infer entities and CRUD modules when implied.`;

  const client = new OpenAI({ apiKey });
  const responseFormat = zodResponseFormat(SaaSBriefSchema, "SaaSAppBrief");

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    response_format: responseFormat,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  const result = SaaSBriefSchema.safeParse(parsed);

  if (result.success) {
    console.log("[parsePromptUnified] AI response validated on first attempt");
    return zodToAppBrief(result.data);
  }

  const errors = result.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.warn(`[parsePromptUnified] Validation failed, attempting repair...\n${errors}`);

  const repairResponse = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "Repair this JSON so it matches the schema exactly. Return only the corrected JSON.",
      },
      {
        role: "user",
        content: `The following JSON failed validation:\n\n${content}\n\nErrors:\n${errors}\n\nFix it to match the schema.`,
      },
    ],
    response_format: responseFormat,
  });

  const repairContent = repairResponse.choices[0]?.message?.content;
  if (!repairContent) throw new Error("Empty repair response");

  const repairParsed = JSON.parse(repairContent);
  const repairResult = SaaSBriefSchema.safeParse(repairParsed);

  if (repairResult.success) {
    console.log("[parsePromptUnified] AI response validated after repair");
    return zodToAppBrief(repairResult.data);
  }

  throw new Error("Repair validation also failed");
}

function zodToAppBrief(parsed: unknown): SaaSAppBrief {
  const p = parsed as unknown as SaaSAppBrief & {
    meta: SaaSAppBrief["meta"] & { description: string | null };
    navigation: SaaSAppBrief["navigation"] & { secondary: string | null };
    modules: Array<SaaSAppBrief["modules"][number] & { entityRef: string | null }>;
    entities: Array<{
      id: string;
      label: string;
      pluralLabel: string;
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
        ui: string | null;
        options: string[] | null;
      }>;
      screens: { list: boolean; detail: boolean; create: boolean; edit: boolean };
    }>;
  };

  return {
    version: p.version,
    type: p.type,
    meta: {
      appName: p.meta.appName,
      description: p.meta.description ?? undefined,
      designSystem: p.meta.designSystem,
      frontend: p.meta.frontend,
      density: p.meta.density,
      theme: p.meta.theme,
      breakpoints: p.meta.breakpoints,
    },
    navigation: {
      primary: p.navigation.primary,
      secondary: (p.navigation.secondary ?? undefined) as "topbar" | "tabs" | undefined,
      includeBreadcrumbs: p.navigation.includeBreadcrumbs,
      includeSearch: p.navigation.includeSearch,
      includeNotifications: p.navigation.includeNotifications,
      includeProfileMenu: p.navigation.includeProfileMenu,
    },
    modules: p.modules.map((m) => ({
      id: m.id,
      type: m.type,
      label: m.label,
      enabled: m.enabled,
      entityRef: m.entityRef ?? undefined,
    })),
    entities: p.entities.map((e) => ({
      id: e.id,
      label: e.label,
      pluralLabel: e.pluralLabel,
      fields: e.fields.map((f) => ({
        name: f.name,
        type: f.type as "string" | "number" | "date" | "enum" | "boolean",
        required: f.required,
        ui: f.ui ?? undefined,
        options: f.options ?? undefined,
      })),
      screens: e.screens,
    })),
    flows: p.flows,
    states: p.states,
    generation: p.generation,
  };
}

export async function parsePromptUnified(prompt: string): Promise<SaaSAppBrief> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log("[parsePromptUnified] No OPENAI_API_KEY found, using regex fallback");
    return parsePromptToBrief(prompt);
  }

  try {
    return await runAIParsing(prompt, apiKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[parsePromptUnified] AI parsing failed: ${msg}, using regex fallback`);
    return parsePromptToBrief(prompt);
  }
}
