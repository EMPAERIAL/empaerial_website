// src/Lib/applicationMailer.js
// Sends application notifications to the team inbox over SMTP.
import nodemailer from "nodemailer";

const DEFAULT_RECIPIENT = "empaerial.uav@gmail.com";

const FIELD_LABELS = [
  ["full_name", "Name"],
  ["email", "Email"],
  ["phone", "Phone / WhatsApp"],
  ["country", "Country"],
  ["university", "University & programme"],
  ["department", "Department"],
  ["skills", "Skills & tools"],
  ["portfolio_url", "Portfolio"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isMailerConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  );
}

function getTransport() {
  const port = Number(process.env.SMTP_PORT || 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function titleCase(value) {
  return String(value ?? "").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildBodies(row) {
  const rows = FIELD_LABELS.filter(([key]) => row[key]).map(([key, label]) => [
    label,
    key === "department" ? titleCase(row[key]) : row[key],
  ]);

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Why they want to join:",
    row.motivation,
  ].join("\n");

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#000;line-height:1.6">
      <h2 style="font-size:18px;letter-spacing:0.04em;text-transform:uppercase;margin:0 0 18px">
        New EMPÆRIAL application
      </h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:4px 16px 4px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;vertical-align:top;white-space:nowrap">${escapeHtml(
              label
            )}</td>
            <td style="padding:4px 0;font-size:14px">${escapeHtml(value)}</td>
          </tr>`
          )
          .join("")}
      </table>
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;margin:0 0 6px">
        Why they want to join
      </p>
      <p style="font-size:14px;white-space:pre-wrap;margin:0">${escapeHtml(
        row.motivation
      )}</p>
    </div>
  `;

  return { text, html };
}

/**
 * Emails one application to the team inbox.
 * Throws when SMTP is not configured or the send fails, so the caller can
 * decide whether the submission still counts as delivered.
 */
export async function sendApplicationEmail(row) {
  if (!isMailerConfigured()) {
    throw new Error(
      "SMTP is not configured (SMTP_HOST / SMTP_USER / SMTP_PASSWORD)."
    );
  }

  const to = process.env.APPLICATIONS_TO_EMAIL || DEFAULT_RECIPIENT;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const { text, html } = buildBodies(row);

  await getTransport().sendMail({
    from: `"EMPÆRIAL Applications" <${from}>`,
    to,
    // Replying in the inbox goes straight back to the applicant.
    replyTo: row.email,
    subject: `New application — ${row.full_name} (${titleCase(row.department)})`,
    text,
    html,
  });
}
