/**
 * Cloudflare Pages Function — receives lead-form submissions and emails them
 * to the team via Resend.
 *
 * Required environment variables (set in the Cloudflare Pages dashboard):
 *   RESEND_API_KEY  — Resend API key
 *   CONTACT_TO      — where submissions are sent (e.g. hello@incori.org)
 *   CONTACT_FROM    — a verified Resend sender (e.g. website@incori.org)
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
  email: 'Email',
  phone: 'Phone',
  service: 'Service of interest',
  who: 'Requesting for',
  role: 'Role of interest',
  availability: 'Availability',
  interest: 'Area of interest',
  message: 'Message',
};

const FORM_TITLES: Record<string, string> = {
  'request-services': 'New Service Request',
  apply: 'New Job Application',
  volunteer: 'New Volunteer Inquiry',
  contact: 'New Contact Message',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Please provide your name and a valid email.' }, 422);
  }

  const formType = (body.formType || 'contact').trim();
  const subject = `${FORM_TITLES[formType] ?? 'New Message'} — ${name}`;

  const rows = Object.entries(body)
    .filter(([k, v]) => k !== 'company' && String(v).trim() !== '')
    .map(([k, v]) => {
      const label = FIELD_LABELS[k] ?? k;
      return `<tr><td style="padding:6px 14px 6px 0;color:#55606a;font:600 13px sans-serif;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:6px 0;color:#161b1d;font:14px sans-serif">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`;
    })
    .join('');

  const html = `<div style="max-width:560px;margin:auto;font-family:sans-serif">
    <div style="height:4px;background:linear-gradient(100deg,#1feaf7,#0076d6,#b52b2b,#f15b5d,#ffb847);border-radius:4px"></div>
    <h2 style="color:#161b1d;margin:20px 0 4px">${esc(FORM_TITLES[formType] ?? 'New Message')}</h2>
    <p style="color:#55606a;margin:0 0 16px;font-size:14px">Submitted from incori.org</p>
    <table style="border-collapse:collapse;width:100%">${rows}</table>
  </div>`;

  const text = Object.entries(body)
    .filter(([k, v]) => k !== 'company' && String(v).trim() !== '')
    .map(([k, v]) => `${FIELD_LABELS[k] ?? k}: ${v}`)
    .join('\n');

  // Email backend not configured yet — accept the submission so the UI works.
  if (!env.RESEND_API_KEY) {
    console.warn('[contact] RESEND_API_KEY not set — submission accepted but not emailed.');
    return json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'website@incori.org',
        to: [env.CONTACT_TO || 'hello@incori.org'],
        reply_to: email,
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      console.error('[contact] Resend error', res.status, await res.text());
      return json({ ok: false, error: 'Delivery failed.' }, 502);
    }
    return json({ ok: true, delivered: true });
  } catch (err) {
    console.error('[contact] send failed', err);
    return json({ ok: false, error: 'Delivery failed.' }, 500);
  }
}
