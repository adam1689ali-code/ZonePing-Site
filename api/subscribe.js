// /api/subscribe.js — no dependencies required
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.TO_EMAIL || 'service@zoneping.com';
    const from = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // works immediately

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to,
        subject: 'New ZonePing waitlist signup',
        text: `Email: ${email}\nTime: ${new Date().toISOString()}`
      })
    });

    if (!r.ok) return res.status(500).json({ error: 'Email send failed' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
}
