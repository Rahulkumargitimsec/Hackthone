import fs from "fs";
import path from "path";

const dataDir = path.resolve(__dirname, "./");

function ensureDataDir() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {}
}

export function readJson<T>(name: string, defaultValue: T): T {
  ensureDataDir();
  const p = path.join(dataDir, name + ".json");
  try {
    if (!fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch (e) {
    return defaultValue;
  }
}

export function writeJson<T>(name: string, data: T) {
  ensureDataDir();
  const p = path.join(dataDir, name + ".json");
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

export default { readJson, writeJson };
