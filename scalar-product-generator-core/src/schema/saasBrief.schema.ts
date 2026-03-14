import { z } from "zod";

const ModuleTypeSchema = z.enum([
  "dashboard",
  "entity",
  "analytics",
  "settings",
  "auth",
]);

const BriefFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "date", "enum", "boolean"]),
  required: z.boolean(),
  ui: z.string().nullable(),
  options: z.array(z.string()).nullable(),
});

const BriefEntitySchema = z.object({
  id: z.string(),
  label: z.string(),
  pluralLabel: z.string(),
  fields: z.array(BriefFieldSchema),
  screens: z.object({
    list: z.boolean(),
    detail: z.boolean(),
    create: z.boolean(),
    edit: z.boolean(),
  }),
});

const BriefModuleSchema = z.object({
  id: z.string(),
  type: ModuleTypeSchema,
  label: z.string(),
  enabled: z.boolean(),
  entityRef: z.string().nullable(),
});

export const SaaSBriefSchema = z.object({
  version: z.string(),
  type: z.literal("saas-app-brief"),
  meta: z.object({
    appName: z.string(),
    description: z.string().nullable(),
    designSystem: z.string(),
    frontend: z.string(),
    density: z.enum(["compact", "comfortable"]),
    theme: z.enum(["light", "dark"]),
    breakpoints: z.array(z.string()),
  }),
  navigation: z.object({
    primary: z.enum(["sidebar", "topbar"]),
    secondary: z.enum(["topbar", "tabs"]).nullable(),
    includeBreadcrumbs: z.boolean(),
    includeSearch: z.boolean(),
    includeNotifications: z.boolean(),
    includeProfileMenu: z.boolean(),
  }),
  modules: z.array(BriefModuleSchema),
  entities: z.array(BriefEntitySchema),
  flows: z.object({
    auth: z.object({
      enabled: z.boolean(),
      screens: z.array(z.string()),
    }),
    onboarding: z.object({
      enabled: z.boolean(),
      screens: z.array(z.string()),
    }),
  }),
  states: z.object({
    includeLoading: z.boolean(),
    includeEmpty: z.boolean(),
    includeError: z.boolean(),
  }),
  generation: z.object({
    mode: z.enum(["lowfi", "hifi"]),
    includeHiFiHints: z.boolean(),
    includeDataBindings: z.boolean(),
    includeInteractions: z.boolean(),
    includeRoutes: z.boolean(),
  }),
});

export type SaaSBriefZod = z.infer<typeof SaaSBriefSchema>;
