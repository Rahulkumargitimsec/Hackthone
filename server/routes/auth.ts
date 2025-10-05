import { RequestHandler } from "express";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(USERS_FILE);
  } catch (e) {
    await fs.writeFile(USERS_FILE, "[]", "utf-8");
  }
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function createToken(id: string) {
  return Buffer.from(`${id}:${Date.now()}`).toString("base64");
}

export const handleRegister: RequestHandler = async (req, res) => {
  const { name, email, phone, password } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  await ensureDataFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  const users = JSON.parse(raw) as any[];

  const existing = users.find((u) => u.email === email);
  if (existing) return res.status(409).json({ error: "User already exists" });

  const id = `${Date.now()}`;
  const hashed = hashPassword(password);
  const user = {
    id,
    name: name ?? "",
    email,
    phone: phone ?? "",
    password: hashed,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");

  const token = createToken(id);
  const safe = { id, name: user.name, email: user.email, phone: user.phone };
  return res.status(201).json({ user: safe, token });
};

export const handleLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  await ensureDataFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  const users = JSON.parse(raw) as any[];

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });

  const hashed = hashPassword(password);
  if (hashed !== user.password)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = createToken(user.id);
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
  return res.status(200).json({ user: safe, token });
};
