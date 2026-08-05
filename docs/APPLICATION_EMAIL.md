# Application Email Delivery

Submissions from `/apply` are emailed to the team inbox by
`POST /api/applications` (see `src/Lib/applicationMailer.js`).

## Required Environment Variables

Set these in `.env.local` and in the hosting provider's environment settings:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=empaerial.uav@gmail.com
SMTP_PASSWORD=<16-character Google app password>

# Optional overrides
SMTP_FROM=empaerial.uav@gmail.com        # defaults to SMTP_USER
APPLICATIONS_TO_EMAIL=empaerial.uav@gmail.com  # defaults to this address
```

Port `465` connects over implicit TLS; port `587` is also supported and upgrades
via STARTTLS.

## Getting a Gmail App Password

Gmail rejects a normal account password over SMTP. For `empaerial.uav@gmail.com`:

1. Enable 2-Step Verification on the Google account.
2. Go to <https://myaccount.google.com/apppasswords>.
3. Create an app password (name it e.g. "Empaerial website").
4. Copy the 16-character value into `SMTP_PASSWORD` — no spaces.

App passwords are per-application, so revoking one does not affect the account.

## What Gets Sent

One email per application, with:

- subject: `New application — <name> (<department>)`
- `Reply-To` set to the applicant's address, so replying in the inbox answers
  them directly
- a plain-text part and an HTML table of every field they filled in

## Delivery Guarantees

The route emails the application and, when the Supabase `Applications` table
exists, also archives it. Either sink alone counts as success — the applicant
only sees an error if both fail. Failures are logged server-side:

- `Application email failed: …` — SMTP is misconfigured or rejected the message
- `Application archive skipped: …` — no Applications table (harmless if you are
  only using email)

## Verification

With the env vars set, submit the form at `/apply` and confirm the email lands
in `empaerial.uav@gmail.com`. A 500 from the endpoint means both delivery paths
failed; check the server logs for the two messages above.
