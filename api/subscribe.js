// /api/subscribe.js — Edge runtime (works without npm deps, parses JSON reliably)
export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'content-type': 'application/json' }
    });
  }

  try {
    // Parse JSON body safely in Edge runtime
    let email = '';
    try {
      const data = await req.json();
      email = (data?.email || '').trim();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'content-type': 'application/json' }
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400, headers: { 'content-type': 'application/json' }
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to     = process.env.TO_EMAIL || 'service@zoneping.com';
    const from   = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), {
        status: 500, headers: { 'content-type': 'application/json' }
      });
    }

    // Send email via Resend REST API
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

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'Resend failed', detail }), {
        status: 500, headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error', detail: String(e) }), {
      status: 500, headers: { 'content-type': 'application/json' }
    });
  }
}
