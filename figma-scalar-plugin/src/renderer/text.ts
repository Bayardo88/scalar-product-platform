const FONT_FAMILY = "Inter";
const FONT_STYLE = "Regular";

let fontLoaded = false;

export async function ensureFontLoaded(): Promise<void> {
  if (fontLoaded) return;
  await figma.loadFontAsync({ family: FONT_FAMILY, style: FONT_STYLE });
  fontLoaded = true;
}

export async function createTextNode(
  characters: string,
  options?: { fontSize?: number; color?: RGB }
): Promise<TextNode> {
  await ensureFontLoaded();

  const textNode = figma.createText();
  textNode.characters = characters;
  textNode.fontName = { family: FONT_FAMILY, style: FONT_STYLE };

  if (options?.fontSize) {
    textNode.fontSize = options.fontSize;
  }

  if (options?.color) {
    textNode.fills = [{ type: "SOLID", color: options.color }];
  }

  return textNode;
}

export function headingFontSize(role: string): number {
  if (role === "text.heading") return 24;
  if (role === "text.label") return 12;
  return 14;
}
