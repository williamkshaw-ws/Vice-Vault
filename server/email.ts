import nodemailer from "nodemailer";

let mailTransporter: any = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || ""
    }
  });
  console.log(`Configured SMTP mail transporter for host: ${process.env.SMTP_HOST}`);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY || mailTransporter);
}

interface BrandedEmailLayoutOptions {
  title: string;
  subtitle: string;
  badgeGradient: string;
  accentColor: string;
  buttonColor: string;
  buttonShadow: string;
  bodyHtml: string;
  ctaUrl: string;
  ctaLabel: string;
  footerLines: string[];
}

function renderBrandedEmailHtml(opts: BrandedEmailLayoutOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #171717; border: 1px solid #262626; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #262626;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: ${opts.badgeGradient}; color: #ffffff; font-size: 20px; font-weight: 900; margin-bottom: 12px; text-align: center;">
                ⛳
              </div>
              <h1 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #ffffff;">GOLF BALL VAULT</h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #a3a3a3; text-transform: uppercase; letter-spacing: 1px;">${opts.subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #e5e5e5;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #d4d4d4;">
                ${opts.bodyHtml}
              </p>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 28px 0;">
                    <a href="${opts.ctaUrl}" target="_blank" style="display: inline-block; background-color: ${opts.buttonColor}; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: ${opts.buttonShadow};">
                      ${opts.ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              ${opts.footerLines.map((line, i) => `<p style="margin: 0 0 ${i === opts.footerLines.length - 1 ? "0" : "8px"} 0; font-size: 12px; line-height: 18px; color: #737373;">${line}</p>`).join("\n")}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0f0f0f; border-top: 1px solid #262626; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-family: monospace; color: #525252;">
                Golf Ball Vault • <a href="https://golfballvault.app" target="_blank" style="color: ${opts.accentColor}; text-decoration: none;">golfballvault.app</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendBrandedEmail(targetEmail: string, subject: string, html: string, label: string): Promise<boolean> {
  // 1. Resend API (HTTP REST API, no SMTP ports needed)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "Golf Ball Vault <noreply@golfballvault.app>",
          to: [targetEmail],
          subject,
          html
        })
      });
      if (res.ok) {
        console.log(`Sent ${label} via Resend to ${targetEmail}`);
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Resend API error:", errData);
      }
    } catch (e) {
      console.error(`Failed sending ${label} via Resend:`, e);
    }
  }

  // 2. Standard SMTP Transporter (Nodemailer)
  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: process.env.MAIL_FROM || '"Golf Ball Vault" <noreply@golfballvault.app>',
        to: targetEmail,
        subject,
        html
      });
      console.log(`Sent ${label} via SMTP to ${targetEmail}`);
      return true;
    } catch (e) {
      console.error(`Failed sending ${label} via SMTP:`, e);
    }
  }

  return false;
}

export async function sendBrandedPasswordResetEmail(targetEmail: string, resetUrl: string): Promise<boolean> {
  const html = renderBrandedEmailHtml({
    title: "Reset Your Golf Ball Vault Password",
    subtitle: "Account Security & Recovery",
    badgeGradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    accentColor: "#60a5fa",
    buttonColor: "#2563eb",
    buttonShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
    bodyHtml: `We received a request to reset the password for your <strong>Golf Ball Vault</strong> account (<span style="color: #60a5fa; font-family: monospace;">${targetEmail}</span>). Click the button below to choose a new password:`,
    ctaUrl: resetUrl,
    ctaLabel: "Reset Password",
    footerLines: [
      "This link will expire in <strong>1 hour</strong>.",
      "If you did not request a password reset, you can safely disregard this email. Your password will remain unchanged."
    ]
  });
  return sendBrandedEmail(targetEmail, "Reset your Golf Ball Vault password", html, "branded password reset email");
}

export async function sendBrandedEmailVerificationEmail(targetEmail: string, verifyUrl: string): Promise<boolean> {
  const html = renderBrandedEmailHtml({
    title: "Verify Your Golf Ball Vault Email",
    subtitle: "Account Email Verification",
    badgeGradient: "linear-gradient(135deg, #10b981, #059669)",
    accentColor: "#34d399",
    buttonColor: "#10b981",
    buttonShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
    bodyHtml: `Please verify your email address (<span style="color: #34d399; font-family: monospace;">${targetEmail}</span>) to secure your <strong>Golf Ball Vault</strong> account and ensure you can recover your locker anytime:`,
    ctaUrl: verifyUrl,
    ctaLabel: "Verify Email Address",
    footerLines: [
      "This link will expire in <strong>24 hours</strong>.",
      "If you did not request this verification or create an account, you can safely ignore this email."
    ]
  });
  return sendBrandedEmail(targetEmail, "Verify your Golf Ball Vault email address", html, "branded email verification");
}
