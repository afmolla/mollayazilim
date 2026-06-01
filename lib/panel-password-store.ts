import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getDataDir } from "@/lib/data-dir";

const scryptAsync = promisify(scrypt);
const DEFAULT_PANEL_PASSWORD = "demo123";

type PanelPasswordRecord = {
  algorithm: "scrypt";
  salt: string;
  hash: string;
};

async function passwordFile(): Promise<string> {
  return path.join(await getDataDir(), "panel-auth.json");
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")): Promise<PanelPasswordRecord> {
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return {
    algorithm: "scrypt",
    salt,
    hash: derived.toString("hex"),
  };
}

async function readStoredPassword(): Promise<PanelPasswordRecord | null> {
  try {
    const raw = await fs.readFile(await passwordFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PanelPasswordRecord>;
    if (parsed.algorithm !== "scrypt" || !parsed.salt || !parsed.hash) return null;
    return parsed as PanelPasswordRecord;
  } catch {
    return null;
  }
}

async function verifyHash(password: string, record: PanelPasswordRecord): Promise<boolean> {
  try {
    const derived = (await scryptAsync(password, record.salt, 64)) as Buffer;
    const expected = Buffer.from(record.hash, "hex");
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

function envFallbackPassword(): string {
  const envPassword = process.env.PANEL_PASSWORD?.trim();
  return envPassword || DEFAULT_PANEL_PASSWORD;
}

export async function panelPasswordMatches(password: string | undefined): Promise<boolean> {
  const candidate = password?.trim();
  if (!candidate) return false;
  const stored = await readStoredPassword();
  if (stored) return verifyHash(candidate, stored);
  return candidate === envFallbackPassword();
}

export async function panelPasswordKaydet(newPassword: string): Promise<void> {
  const file = await passwordFile();
  const record = await hashPassword(newPassword);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}
