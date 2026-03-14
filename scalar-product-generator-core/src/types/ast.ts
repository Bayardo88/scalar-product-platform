export interface ASTLayout {
  display?: "stack" | "grid" | "absolute";
  direction?: "horizontal" | "vertical";
  gap?: number;
  columns?: number | Record<string, number>;
  padding?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface ASTInteraction {
  event: "click" | "submit";
  action: {
    type: "navigate" | "openOverlay" | "submitForm";
    targetId?: string;
    path?: string;
  };
}

export interface ASTDataBinding {
  bind?: string;
  itemKey?: string;
  fields?: Record<string, string>;
}

export interface ASTNode {
  id: string;
  type: "Region" | "ComponentInstance" | "Text" | "Primitive" | "Collection" | "Form" | "Overlay";
  role: string;
  name: string;
  props?: Record<string, unknown>;
  layout?: ASTLayout;
  data?: ASTDataBinding;
  interactions?: ASTInteraction[];
  children?: ASTNode[];
}

export interface ASTScreen {
  id: string;
  name: string;
  rootNodeId: string;
}

export interface ASTRoute {
  id: string;
  path: string;
  screenId: string;
  layout?: string;
}

export interface DesignAST {
  version: string;
  meta: {
    appName: string;
    designSystem: string;
    mode: "lowfi" | "hifi";
    generatedAt: string;
  };
  routes: ASTRoute[];
  screens: ASTScreen[];
  nodes: ASTNode[];
}
