import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import fs from "fs-extra";
import path from "path";

const TOKEN_FILE = path.resolve(process.cwd(), ".scalar-sync/.bridge-token");

let cachedToken: string | null = null;

export function isAuthEnabled(): boolean {
  return process.env.SCALAR_BRIDGE_AUTH === "true";
}

export async function getOrCreateToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  if (process.env.SCALAR_BRIDGE_TOKEN) {
    cachedToken = process.env.SCALAR_BRIDGE_TOKEN;
    return cachedToken;
  }

  try {
    if (await fs.pathExists(TOKEN_FILE)) {
      cachedToken = (await fs.readFile(TOKEN_FILE, "utf-8")).trim();
      return cachedToken;
    }
  } catch {}

  cachedToken = crypto.randomBytes(32).toString("hex");

  await fs.ensureDir(path.dirname(TOKEN_FILE));
  await fs.writeFile(TOKEN_FILE, cachedToken, "utf-8");

  return cachedToken;
}

export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isAuthEnabled()) {
      next();
      return;
    }

    if (req.path === "/health") {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        ok: false,
        error: "Missing Authorization header. Set SCALAR_BRIDGE_AUTH=true and use Bearer <token>.",
      });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        ok: false,
        error: "Invalid Authorization header format. Use: Bearer <token>",
      });
      return;
    }

    const token = parts[1];
    const expectedToken = await getOrCreateToken();

    if (token !== expectedToken) {
      res.status(403).json({
        ok: false,
        error: "Invalid token.",
      });
      return;
    }

    next();
  };
}
