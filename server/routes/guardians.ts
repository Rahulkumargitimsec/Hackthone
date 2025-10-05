import { RequestHandler } from "express";
import store from "../data/store";

type Guardian = { id: string; name: string; phone?: string; email?: string; primary?: boolean };

export const getGuardians: RequestHandler = (req, res) => {
  const g = store.readJson<Guardian[]>("guardians", []);
  res.json(g);
};

export const addGuardian: RequestHandler = (req, res) => {
  const body = req.body as Guardian;
  if (!body || !body.name) return res.status(400).json({ error: "name-required" });
  const list = store.readJson<Guardian[]>("guardians", []);
  const g: Guardian = { id: Date.now().toString(), name: body.name, phone: body.phone, email: body.email, primary: !!body.primary };
  list.unshift(g);
  store.writeJson("guardians", list);
  res.status(201).json(g);
};

export const updateGuardian: RequestHandler = (req, res) => {
  const id = req.params.id;
  const body = req.body as Partial<Guardian>;
  const list = store.readJson<Guardian[]>("guardians", []);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "not-found" });
  list[idx] = { ...list[idx], ...body };
  store.writeJson("guardians", list);
  res.json(list[idx]);
};

export const deleteGuardian: RequestHandler = (req, res) => {
  const id = req.params.id;
  const list = store.readJson<Guardian[]>("guardians", []);
  const n = list.filter((x) => x.id !== id);
  store.writeJson("guardians", n);
  res.json({ ok: true });
};

export default { getGuardians, addGuardian, updateGuardian, deleteGuardian };
