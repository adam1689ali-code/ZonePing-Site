// /api/subscribe.js — Vercel Serverless Function
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.TO_EMAIL || 'service@zoneping.com';

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject: 'New ZonePing waitlist signup',
      text: `Email: ${email}\nTime: ${new Date().toISOString()}`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
