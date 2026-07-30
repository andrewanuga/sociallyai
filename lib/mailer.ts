import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

/**
 * SMTP transporter built from env vars. Returns null when not configured,
 * so callers can degrade gracefully (e.g. still store the ticket).
 *
 * Gmail example:
 *   SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_SECURE=true
 *   SMTP_USER=socially.ai.io@gmail.com  SMTP_PASS=<16-char app password>
 */
export function getTransporter(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  cached = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return cached;
}

export const MAIL_FROM =
  process.env.SMTP_FROM || process.env.SMTP_USER || "socially.ai.io@gmail.com";
