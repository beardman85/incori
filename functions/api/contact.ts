/**
 * Cloudflare Pages Function — receives lead-form submissions and:
 *   1. emails the submission to the team (CONTACT_TO), and
 *   2. sends the person who submitted a branded confirmation (auto-reply).
 * Both are delivered via Resend.
 *
 * Required environment variables (set in the Cloudflare Pages dashboard):
 *   RESEND_API_KEY  — Resend API key
 *   CONTACT_TO      — where submissions are sent (e.g. hello@incori.org)
 *   CONTACT_FROM    — a verified Resend sender, e.g. "Inclusion Oriented <no-reply@incori.org>"
 *
 * Until RESEND_API_KEY is set, the endpoint accepts submissions and returns
 * ok:true with delivered:false (so the form UI works), and logs a warning.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const FIELD_LABELS: Record<string, string> = {
  formType: 'Form',
  name: 'Name',
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email',
  phone: 'Phone',
  who: 'Requesting for',
  dob: 'Date of birth',
  service: 'Service of interest',
  city: 'City / area',
  startDate: 'Preferred start date',
  caseManager: 'Has case manager / coordinator',
  hearAbout: 'Heard about us via',
  role: 'Role of interest',
  availability: 'Availability',
  interest: 'Area of interest',
  message: 'Message',
  consent: 'Consent given',
};

const FORM_TITLES: Record<string, string> = {
  'request-services': 'New Service Request',
  apply: 'New Job Application',
  volunteer: 'New Volunteer Inquiry',
  contact: 'New Contact Message',
};

// Per-form confirmation (auto-reply) copy sent to the person who submitted.
interface AutoReply {
  subject: string;
  intro: string;
  steps: string[];
}
const AUTO_REPLY: Record<string, AutoReply> = {
  'request-services': {
    subject: 'We received your request — Inclusion Oriented',
    intro:
      "Thank you for reaching out to Inclusion Oriented. We've received your service request, and a member of our team will be in touch soon to help you get started.",
    steps: [
      'We review the details you shared.',
      'Our team reaches out to understand your needs and answer any questions.',
      'Together we build a person-centered plan and get started.',
    ],
  },
  apply: {
    subject: 'Thanks for applying — Inclusion Oriented',
    intro:
      "Thank you for your interest in joining the Inclusion Oriented team! We've received your application, and our team will review your details and reach out about opportunities that fit.",
    steps: [
      'We review your application.',
      'Our team reaches out to learn more about you.',
      'We talk through roles, benefits, and next steps.',
    ],
  },
  volunteer: {
    subject: 'Thank you for volunteering — Inclusion Oriented',
    intro:
      "Thank you for your interest in volunteering with Inclusion Oriented! We're grateful for your time and compassion, and our team will reach out with ways you can get involved.",
    steps: [
      'We review your interest and availability.',
      'Our team reaches out with volunteer opportunities.',
      'You start making a difference in your community.',
    ],
  },
  contact: {
    subject: 'We received your message — Inclusion Oriented',
    intro:
      "Thank you for reaching out to Inclusion Oriented. We've received your message and will get back to you soon.",
    steps: [],
  },
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GRADIENT = 'linear-gradient(100deg,#1feaf7,#0076d6,#b52b2b,#f15b5d,#ffb847)';

/** Branded HTML confirmation email for the person who submitted. */
function autoReplyHtml(firstName: string, cfg: AutoReply, origin: string): string {
  const steps = cfg.steps.length
    ? `<p style="margin:20px 0 4px;font:700 12px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#0076d6;">What happens next</p>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
         ${cfg.steps
           .map(
             (s, i) => `<tr>
             <td width="34" valign="top" style="padding:7px 12px 7px 0;">
               <div style="width:26px;height:26px;border-radius:13px;background:#0076d6;color:#ffffff;font:700 13px Arial,sans-serif;text-align:center;line-height:26px;">${i + 1}</div>
             </td>
             <td valign="top" style="padding:7px 0;font:14px/1.5 Arial,sans-serif;color:#55606a;">${esc(s)}</td>
           </tr>`
           )
           .join('')}
       </table>`
    : '';

  return `<div style="background:#f5f7fa;margin:0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6ebf1;">
      <tr><td style="height:6px;background:#0076d6;background:${GRADIENT};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:30px 32px 4px;text-align:center;">
        <img src="${origin}/logos/logo-horizontal.png" alt="Inclusion Oriented" width="230" style="width:230px;max-width:72%;height:auto;" />
      </td></tr>
      <tr><td style="padding:16px 32px 0;">
        <h1 style="margin:0 0 10px;font:700 22px Arial,sans-serif;color:#161b1d;">Thank you, ${esc(firstName)}!</h1>
        <p style="margin:0;font:15px/1.65 Arial,sans-serif;color:#55606a;">${esc(cfg.intro)}</p>
        ${steps}
        <p style="margin:18px 0 0;font:15px/1.65 Arial,sans-serif;color:#55606a;">Have a question in the meantime? Just reply to this email or call us at <a href="tel:+15312255858" style="color:#0076d6;text-decoration:none;">531-225-5858</a>.</p>
        <p style="margin:22px 0 0;font:15px/1.6 Arial,sans-serif;color:#161b1d;">Warm regards,<br><strong>The Inclusion Oriented Team</strong></p>
      </td></tr>
      <tr><td style="padding:22px 32px 0;"><div style="border-top:1px solid #e6ebf1;">&nbsp;</div></td></tr>
      <tr><td style="padding:8px 32px 28px;font:12px/1.7 Arial,sans-serif;color:#8a95a1;">
        <strong style="color:#161b1d;">Inclusion Oriented</strong> — Ground for Strength<br>
        3925 S 147th Street, Suite #117, Omaha, NE 68144<br>
        <a href="tel:+15312255858" style="color:#0076d6;text-decoration:none;">531-225-5858</a> &nbsp;&middot;&nbsp; <a href="mailto:hello@incori.org" style="color:#0076d6;text-decoration:none;">hello@incori.org</a>
      </td></tr>
    </table>
    <p style="max-width:560px;margin:14px auto 0;text-align:center;font:11px/1.5 Arial,sans-serif;color:#aeb9c2;">This is an automated confirmation because you contacted Inclusion Oriented.</p>
  </div>`;
}

function autoReplyText(firstName: string, cfg: AutoReply): string {
  const steps = cfg.steps.length
    ? '\nWhat happens next:\n' + cfg.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n') + '\n'
    : '';
  return `Thank you, ${firstName}!

${cfg.intro}
${steps}
Have a question in the meantime? Just reply to this email or call us at 531-225-5858.

Warm regards,
The Inclusion Oriented Team

Inclusion Oriented — Ground for Strength
3925 S 147th Street, Suite #117, Omaha, NE 68144
531-225-5858 · hello@incori.org`;
}

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  let body: Record<string, string>;
  try {
    body = (await request.json()) as Record<string, string>;
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  // Honeypot — silently accept and drop.
  if (body.company) return json({ ok: true, delivered: false });

  const name = (body.name || `${body.firstName || ''} ${body.lastName || ''}`).trim();
  const email = (body.email || '').trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Please provide your name and a valid email.' }, 422);
  }

  const formType = (body.formType || 'contact').trim();
  const subject = `${FORM_TITLES[formType] ?? 'New Message'} — ${name}`;
  const origin = new URL(request.url).origin;

  const rows = Object.entries(body)
    .filter(([k, v]) => k !== 'company' && String(v).trim() !== '')
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k;
      return `<tr><td style="padding:6px 14px 6px 0;color:#55606a;font:600 13px sans-serif;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#161b1d;font:14px sans-serif">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`;
    })
    .join('');

  const teamHtml = `<div style="max-width:560px;margin:auto;font-family:sans-serif">
    <div style="height:4px;background:${GRADIENT};border-radius:4px"></div>
    <h2 style="color:#161b1d;margin:20px 0 4px">${esc(FORM_TITLES[formType] ?? 'New Message')}</h2>
    <p style="color:#55606a;margin:0 0 16px;font-size:14px">Submitted from incori.org</p>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
  </div>`;

  const teamText = Object.entries(body)
    .filter(([k, v]) => k !== 'company' && String(v).trim() !== '')
    .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`)
    .join('\n');

  // Email backend not configured yet — accept the submission so the UI works.
  if (!env.RESEND_API_KEY) {
    console.warn('[contact] RESEND_API_KEY not set — submission accepted but not emailed.');
    return json({ ok: true, delivered: false });
  }

  const from = env.CONTACT_FROM || 'Inclusion Oriented <no-reply@incori.org>';
  const to = env.CONTACT_TO || 'hello@incori.org';

  // 1) Team notification (critical). Reply-to the submitter so the team can reply directly.
  try {
    const res = await sendEmail(env.RESEND_API_KEY, {
      from,
      to: [to],
      reply_to: email,
      subject,
      html: teamHtml,
      text: teamText,
    });
    if (!res.ok) {
      console.error('[contact] Resend (team) error', res.status, await res.text());
      return json({ ok: false, error: 'Delivery failed.' }, 502);
    }
  } catch (err) {
    console.error('[contact] team send failed', err);
    return json({ ok: false, error: 'Delivery failed.' }, 500);
  }

  // 2) Branded confirmation to the submitter (best-effort — don't fail the request).
  try {
    const cfg = AUTO_REPLY[formType] || AUTO_REPLY.contact;
    const firstName = (body.firstName || name.split(' ')[0] || 'there').trim();
    await sendEmail(env.RESEND_API_KEY, {
      from,
      to: [email],
      reply_to: to,
      subject: cfg.subject,
      html: autoReplyHtml(firstName, cfg, origin),
      text: autoReplyText(firstName, cfg),
    });
  } catch (err) {
    console.error('[contact] auto-reply send failed', err);
  }

  return json({ ok: true, delivered: true });
}
