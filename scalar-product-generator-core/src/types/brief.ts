export type ModuleType = "dashboard" | "entity" | "analytics" | "settings" | "auth";

export interface BriefField {
  name: string;
  type: "string" | "number" | "date" | "enum" | "boolean";
  required?: boolean;
  ui?: string;
  options?: string[];
}

export interface BriefEntity {
  id: string;
  label: string;
  pluralLabel: string;
  fields: BriefField[];
  screens: {
    list: boolean;
    detail: boolean;
    create: boolean;
    edit: boolean;
  };
}

export interface BriefModule {
  id: string;
  type: ModuleType;
  label: string;
  enabled: boolean;
  entityRef?: string;
}

export interface SaaSAppBrief {
  version: string;
  type: "saas-app-brief";
  meta: {
    appName: string;
    description?: string;
    designSystem: string;
    frontend: string;
    density: "compact" | "comfortable";
    theme: "light" | "dark";
    breakpoints: string[];
  };
  navigation: {
    primary: "sidebar" | "topbar";
    secondary?: "topbar" | "tabs";
    includeBreadcrumbs?: boolean;
    includeSearch?: boolean;
    includeNotifications?: boolean;
    includeProfileMenu?: boolean;
  };
  modules: BriefModule[];
  entities: BriefEntity[];
  flows: {
    auth: {
      enabled: boolean;
      screens: string[];
    };
    onboarding: {
      enabled: boolean;
      screens: string[];
    };
  };
  states: {
    includeLoading: boolean;
    includeEmpty: boolean;
    includeError: boolean;
  };
  generation: {
    mode: "lowfi" | "hifi";
    includeHiFiHints: boolean;
    includeDataBindings: boolean;
    includeInteractions: boolean;
    includeRoutes: boolean;
  };
}
