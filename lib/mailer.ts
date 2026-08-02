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

export async function sendBroadcastEmail(emails: string[], message: string, type: string) {
  const transporter = getTransporter();
  if (!transporter) return;

  const subject = type === "critical" ? "Critical Update from SociallyAI" : 
                  type === "warning" ? "Action Required: SociallyAI Warning" : 
                  "SociallyAI Announcement";

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="color: #555; line-height: 1.6; font-size: 16px;">
        ${message}
      </p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        You're receiving this because you are registered on SociallyAI.
      </p>
    </div>
  `;

  // Send individually using Promise.allSettled to prevent one failure from blocking others
  await Promise.allSettled(
    emails.map(email => 
      transporter.sendMail({
        from: `"SociallyAI" <${MAIL_FROM}>`,
        to: email,
        subject,
        html,
      })
    )
  );
}
