// Vercel serverless function: receives contact form, sends via Resend.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name = (body.name || '').toString().trim();
  const company = (body.company || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const message = (body.message || '').toString().trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please complete name, email, and message.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#16202b;line-height:1.6">
      <h2 style="margin:0 0 12px">New consultation request</h2>
      <p style="margin:0 0 4px"><strong>Name:</strong> ${esc(name)}</p>
      <p style="margin:0 0 4px"><strong>Company:</strong> ${esc(company) || '—'}</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> ${esc(email)}</p>
      <p style="margin:16px 0 4px"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap">${esc(message)}</p>
      <hr style="border:none;border-top:1px solid #e4e1d9;margin:20px 0" />
      <p style="margin:0;font-size:12px;color:#6c7a89">Sent from the Dominex Holdings website contact form.</p>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Dominex Holdings <noreply@dominexllc.com>',
        to: ['abe@meaship.com'],
        reply_to: email,
        subject: `New inquiry from ${name}${company ? ' · ' + company : ''}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Resend error:', r.status, detail);
      return res.status(502).json({ error: 'Could not send your message right now. Please email abe@meaship.com directly.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please email abe@meaship.com directly.' });
  }
}
