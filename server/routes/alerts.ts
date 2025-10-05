import { RequestHandler } from "express";
import store from "../data/store";

type Report = { id: string; title: string; desc?: string; time: string };

export const listReports: RequestHandler = (req, res) => {
  const r = store.readJson<Report[]>("reports", []);
  res.json(r);
};

export const createReport: RequestHandler = (req, res) => {
  const body = req.body as Partial<Report>;
  const list = store.readJson<Report[]>("reports", []);
  const rep: Report = { id: Date.now().toString(), title: body.title || "Alert", desc: body.desc || "", time: new Date().toISOString() };
  list.unshift(rep);
  store.writeJson("reports", list);
  res.status(201).json(rep);
};

export const ackReport: RequestHandler = (req, res) => {
  const id = req.params.id;
  const list = store.readJson<Report[]>("reports", []);
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "not-found" });
  const [rep] = list.splice(idx, 1);
  store.writeJson("reports", list);

  const acked = store.readJson<Report[]>("acked", []);
  acked.unshift({ ...rep, time: new Date().toISOString() });
  store.writeJson("acked", acked);

  res.json({ ok: true, acked: rep });
};

export default { listReports, createReport, ackReport };
