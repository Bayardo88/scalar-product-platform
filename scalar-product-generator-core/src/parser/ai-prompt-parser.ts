import { SaaSAppBrief, BriefEntity, BriefModule, BriefField } from "../types/brief";

export interface AIParserConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
}

const SYSTEM_PROMPT = `You are a SaaS product architect. Given a natural language product description, extract a structured JSON brief.

Return ONLY valid JSON matching this schema:
{
  "appName": string,
  "description": string,
  "entities": [
    {
      "id": string (PascalCase, singular),
      "label": string,
      "pluralLabel": string,
      "fields": [
        { "name": string, "type": "string"|"number"|"date"|"enum"|"boolean", "required": boolean, "ui": string, "options"?: string[] }
      ],
      "screens": { "list": boolean, "detail": boolean, "create": boolean, "edit": boolean }
    }
  ],
  "modules": [
    { "id": string, "type": "dashboard"|"entity"|"analytics"|"settings"|"auth", "label": string, "enabled": boolean, "entityRef"?: string }
  ],
  "hasAuth": boolean,
  "hasAnalytics": boolean,
  "hasDashboard": boolean,
  "hasSettings": boolean,
  "density": "compact"|"comfortable",
  "theme": "light"|"dark",
  "navigationPrimary": "sidebar"|"topbar"
}

Rules:
- Always include at least a dashboard module
- Always include settings
- Infer entities from the domain (e.g., "project management" implies Project, Task, etc.)
- Each entity should have reasonable fields (id, name/title, status, dates, etc.)
- Use "input.text", "input.select", "input.date" for ui field hints
- If the prompt is vague, make sensible assumptions for a SaaS product`;

interface AIResponse {
  appName: string;
  description: string;
  entities: Array<{
    id: string;
    label: string;
    pluralLabel: string;
    fields: BriefField[];
    screens: { list: boolean; detail: boolean; create: boolean; edit: boolean };
  }>;
  modules: Array<{
    id: string;
    type: "dashboard" | "entity" | "analytics" | "settings" | "auth";
    label: string;
    enabled: boolean;
    entityRef?: string;
  }>;
  hasAuth: boolean;
  hasAnalytics: boolean;
  hasDashboard: boolean;
  hasSettings: boolean;
  density: "compact" | "comfortable";
  theme: "light" | "dark";
  navigationPrimary: "sidebar" | "topbar";
}

async function callLLM(prompt: string, config: AIParserConfig): Promise<string> {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const model = config.model || "gpt-4o-mini";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: config.temperature ?? 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LLM API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function extractJSON(raw: string): string {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in LLM response");
  return jsonMatch[0];
}

function aiResponseToBrief(parsed: AIResponse, originalPrompt: string): SaaSAppBrief {
  const modules: BriefModule[] = parsed.modules.length > 0
    ? parsed.modules
    : [{ id: "dashboard", type: "dashboard" as const, label: "Dashboard", enabled: true }];

  const entities: BriefEntity[] = parsed.entities.length > 0
    ? parsed.entities
    : [{
        id: "Item",
        label: "Item",
        pluralLabel: "Items",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "name", type: "string", required: true, ui: "input.text" },
        ],
        screens: { list: true, detail: true, create: true, edit: true },
      }];

  return {
    version: "1.0",
    type: "saas-app-brief",
    meta: {
      appName: parsed.appName || "Generated SaaS",
      description: originalPrompt,
      designSystem: "DS/Scalar",
      frontend: "react",
      density: parsed.density || "comfortable",
      theme: parsed.theme || "light",
      breakpoints: ["mobile", "tablet", "desktop"],
    },
    navigation: {
      primary: parsed.navigationPrimary || "sidebar",
      secondary: "topbar",
      includeBreadcrumbs: true,
      includeSearch: true,
      includeNotifications: true,
      includeProfileMenu: true,
    },
    modules,
    entities,
    flows: {
      auth: { enabled: parsed.hasAuth !== false, screens: ["login"] },
      onboarding: { enabled: false, screens: [] },
    },
    states: {
      includeLoading: true,
      includeEmpty: true,
      includeError: true,
    },
    generation: {
      mode: "lowfi",
      includeHiFiHints: true,
      includeDataBindings: true,
      includeInteractions: true,
      includeRoutes: true,
    },
  };
}

export async function parsePromptWithAI(
  prompt: string,
  config: AIParserConfig
): Promise<SaaSAppBrief> {
  const raw = await callLLM(prompt, config);
  const jsonStr = extractJSON(raw);
  const parsed: AIResponse = JSON.parse(jsonStr);
  return aiResponseToBrief(parsed, prompt);
}

export function isAIParserAvailable(): boolean {
  return !!(
    process.env.OPENAI_API_KEY ||
    process.env.SCALAR_AI_API_KEY
  );
}

export function getDefaultAIConfig(): AIParserConfig | null {
  const apiKey = process.env.SCALAR_AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    model: process.env.SCALAR_AI_MODEL || "gpt-4o-mini",
    baseUrl: process.env.SCALAR_AI_BASE_URL || "https://api.openai.com/v1",
    temperature: 0.3,
  };
}
