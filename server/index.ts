import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleRegister, handleLogin } from "./routes/auth";
import { handleSendSosEmail } from "./routes/sos";
import * as guardiansRoutes from "./routes/guardians";
import * as alertsRoutes from "./routes/alerts";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // SOS email sender
  app.post("/api/send-sos-email", handleSendSosEmail);

  // Guardians CRUD (file-backed demo)
  app.get("/api/guardians", guardiansRoutes.getGuardians);
  app.post("/api/guardians", guardiansRoutes.addGuardian);
  app.put("/api/guardians/:id", guardiansRoutes.updateGuardian);
  app.delete("/api/guardians/:id", guardiansRoutes.deleteGuardian);

  // Reports/alerts
  app.get("/api/reports", alertsRoutes.listReports);
  app.post("/api/reports", alertsRoutes.createReport);
  app.post("/api/reports/:id/ack", alertsRoutes.ackReport);

  // Auth (JSON-file based) - demo only
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);

  return app;
}
