import { RequestHandler } from "express";
import nodemailer from "nodemailer";

type Guardian = { name?: string; email?: string; phone?: string };

async function sendViaSmtp(guardians: Guardian[], location: { lat: number; lng: number } | null, message?: string) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return { ok: false, reason: "SMTP not configured" };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const locationText = location ? `Location: https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : "Location not available";
  const body = `${message || "SOS alert"}\n\n${locationText}\n\n- This is an automated SOS from the app.`;

  const sendPromises = guardians
    .filter((g) => g && g.email)
    .map((g) =>
      transporter.sendMail({
        from: smtpUser,
        to: g.email,
        subject: "Emergency SOS Alert",
        text: `Hi ${g.name || "guardian"},\n\n${body}`,
      }),
    );

  const results = await Promise.allSettled(sendPromises);
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) return { ok: false, reason: "Some emails failed", failures };
  return { ok: true };
}

async function sendViaMatrix(location: { lat: number; lng: number } | null, message?: string) {
  // Matrix transport: requires MATRIX_HOMESERVER, MATRIX_ACCESS_TOKEN, MATRIX_ROOM_ID
  const homeserver = process.env.MATRIX_HOMESERVER;
  const token = process.env.MATRIX_ACCESS_TOKEN;
  const roomId = process.env.MATRIX_ROOM_ID;
  if (!homeserver || !token || !roomId) return { ok: false, reason: "Matrix not configured" };

  const locationText = location ? `Location: https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : "Location not available";
  const body = `${message || "SOS alert"}\n\n${locationText}\n\n- Automated SOS`;

  try {
    const url = `${homeserver}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message`;
    const txnId = `m${Date.now()}`;
    const res = await fetch(`${url}/${txnId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ msgtype: "m.text", body }),
    });
    if (!res.ok) return { ok: false, reason: `Matrix send failed ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && (e as any).message };
  }
}

async function sendViaTelegram(guardians: Guardian[], location: { lat: number; lng: number } | null, message?: string) {
  // Telegram bot transport: requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return { ok: false, reason: "Telegram not configured" };

  const locationText = location ? `Location: https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : "Location not available";
  const body = `${message || "SOS alert"}\n\n${locationText}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: body }),
    });
    if (!res.ok) return { ok: false, reason: `Telegram send failed ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e && (e as any).message };
  }
}

async function sendViaSmsGateway(guardians: Guardian[], location: { lat: number; lng: number } | null, message?: string) {
  // SMS via email-to-sms gateway domain (configurable): SMS_GATEWAY_DOMAIN
  // Example: if SMS_GATEWAY_DOMAIN=smsgateway.example then we'll send to 1234567890@smsgateway.example
  const gateway = process.env.SMS_GATEWAY_DOMAIN;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!gateway || !smtpHost || !smtpPort || !smtpUser || !smtpPass) return { ok: false, reason: "SMS gateway or SMTP not configured" };

  const transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } });
  const locationText = location ? `Location: https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : "Location not available";
  const body = `${message || "SOS alert"}\n\n${locationText}`;

  const sendPromises = guardians
    .filter((g) => g && g.phone)
    .map((g) => {
      const to = `${g.phone}@${gateway}`;
      return transporter.sendMail({ from: smtpUser, to, subject: "SOS", text: `Hi ${g.name || "guardian"}, ${body}` });
    });

  const results = await Promise.allSettled(sendPromises);
  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) return { ok: false, reason: "Some SMS sends failed", failures };
  return { ok: true };
}

export const handleSendSosEmail: RequestHandler = async (req, res) => {
  const { guardians, location, message } = req.body as { guardians?: Guardian[]; location?: { lat: number; lng: number } | null; message?: string };

  if (!Array.isArray(guardians) || guardians.length === 0) {
    return res.status(400).json({ error: "No guardians provided" });
  }

  const results: Record<string, any> = {};

  // Attempt SMTP email
  try {
    results.smtp = await sendViaSmtp(guardians, location || null, message);
  } catch (e) {
    results.smtp = { ok: false, reason: (e as any).message };
  }

  // Attempt SMS via SMS_GATEWAY_DOMAIN if configured
  try {
    results.sms_gateway = await sendViaSmsGateway(guardians, location || null, message);
  } catch (e) {
    results.sms_gateway = { ok: false, reason: (e as any).message };
  }

  // Attempt Matrix notification
  try {
    results.matrix = await sendViaMatrix(location || null, message);
  } catch (e) {
    results.matrix = { ok: false, reason: (e as any).message };
  }

  // Attempt Telegram notification
  try {
    results.telegram = await sendViaTelegram(guardians, location || null, message);
  } catch (e) {
    results.telegram = { ok: false, reason: (e as any).message };
  }

  return res.status(200).json({ message: "Notifications attempted", results });
};

export default handleSendSosEmail;
