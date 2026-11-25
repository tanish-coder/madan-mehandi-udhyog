import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://evbuchyepfjaxkeekxdm.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YnVjaHllcGZqYXhrZWVreGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTc1OTksImV4cCI6MjExMDkzMzU5OX0.0AAYwjOvchdHRpZh5p1xYIyrw0AzOWomXq07xp9RxtU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getStoredOrEnvSmtpSettings() {
  const envDefaults = {
    host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587),
    username: process.env.SMTP_USER || process.env.VITE_SMTP_USER || '',
    password: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || '',
    from_email:
      process.env.SMTP_FROM_EMAIL ||
      process.env.VITE_SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      process.env.VITE_SMTP_USER ||
      'orders@madanmehandi.com',
    from_name:
      process.env.SMTP_FROM_NAME || process.env.VITE_SMTP_FROM_NAME || 'Madan Mehandi Udhyog',
    encryption: process.env.SMTP_ENCRYPTION || process.env.VITE_SMTP_ENCRYPTION || 'tls',
    is_enabled: true,
  };

  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'smtp_settings')
      .single();
    if (data && data.value) {
      return {
        ...envDefaults,
        ...data.value,
        host: data.value.host || envDefaults.host,
        port: Number(data.value.port || envDefaults.port),
        username: data.value.username || envDefaults.username,
        password: data.value.password || envDefaults.password,
        from_email: data.value.from_email || data.value.username || envDefaults.from_email,
        from_name: data.value.from_name || envDefaults.from_name,
        encryption: data.value.encryption || envDefaults.encryption,
      };
    }
  } catch (err) {
    console.error('[API test-smtp] Error fetching smtp_settings from Supabase:', err);
  }
  return envDefaults;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const stored = await getStoredOrEnvSmtpSettings();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const host = body.host || stored.host || 'smtp.gmail.com';
    const port = Number(body.port || stored.port || 587);
    const username = body.username || stored.username || '';
    const password = body.password || stored.password || '';
    const encryption = body.encryption || stored.encryption || 'tls';
    const from_email = body.from_email || stored.from_email || username || 'orders@madanmehandi.com';
    const from_name = body.from_name || stored.from_name || 'Madan Mehandi Udhyog';
    const recipient_email = body.recipient_email || from_email || username;

    const isSecure = encryption === 'ssl' || port === 465;

    // Persist provided SMTP settings to Supabase settings table
    if (host && username && password) {
      try {
        await supabase.from('settings').upsert(
          {
            key: 'smtp_settings',
            value: {
              ...stored,
              host,
              port,
              username,
              password,
              encryption,
              from_email,
              from_name,
              is_enabled: body.is_enabled ?? stored.is_enabled ?? true,
              auto_send_order: body.auto_send_order ?? stored.auto_send_order ?? true,
              auto_send_payment: body.auto_send_payment ?? stored.auto_send_payment ?? true,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      } catch (dbSaveErr) {
        console.warn('[API test-smtp] Failed to persist smtp_settings:', dbSaveErr);
      }
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: username && password ? { user: username, pass: password } : undefined,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
    });

    await transporter.verify();

    let messageId = null;
    if (recipient_email && recipient_email.includes('@')) {
      const info = await transporter.sendMail({
        from: `"${from_name}" <${from_email || username}>`,
        to: recipient_email,
        subject: '✅ SMTP Connection Test Successful — Madan Mehandi Udhyog',
        text: `Hello!\n\nThis is a confirmation that your SMTP server connection (${host}:${port}) is active and verified.\n\nSender: ${from_name} <${from_email}>\nRecipient: ${recipient_email}\nDate: ${new Date().toLocaleString('en-IN')}\n\nMadan Mehandi Udhyog, Sojat City, Rajasthan`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #551b14; color: #ffffff; padding: 22px; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: bold;">Madan Mehandi Udhyog</h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Pure Sojat Henna Since 1990 • SMTP Gateway Test</p>
            </div>
            <div style="padding: 26px; color: #2d3748; line-height: 1.6;">
              <h2 style="color: #22543d; margin: 0 0 12px 0; font-size: 18px;">✅ SMTP Connection Verified & Active!</h2>
              <p style="font-size: 14px; margin-top: 0;">
                Congratulations! Your mail server credentials have been verified and saved in Supabase, and this test email was successfully dispatched.
              </p>
              <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; background-color: #f7fafc; border-radius: 8px; padding: 12px;">
                <tr><td style="padding: 8px; color: #718096; width: 140px;">Host / Server:</td><td style="padding: 8px; font-weight: bold;">${host}</td></tr>
                <tr><td style="padding: 8px; color: #718096;">Port & Protocol:</td><td style="padding: 8px; font-weight: bold;">${port} (${String(encryption).toUpperCase()})</td></tr>
                <tr><td style="padding: 8px; color: #718096;">Username:</td><td style="padding: 8px; font-weight: bold;">${username || '(anonymous)'}</td></tr>
                <tr><td style="padding: 8px; color: #718096;">From Sender:</td><td style="padding: 8px; font-weight: bold;">${from_name} &lt;${from_email || username}&gt;</td></tr>
                <tr><td style="padding: 8px; color: #718096;">Recipient:</td><td style="padding: 8px; font-weight: bold;">${recipient_email}</td></tr>
                <tr><td style="padding: 8px; color: #718096;">Dispatched At:</td><td style="padding: 8px; font-weight: bold;">${new Date().toLocaleString('en-IN')}</td></tr>
              </table>
            </div>
            <div style="background-color: #edf2f7; padding: 14px; text-align: center; font-size: 11px; color: #718096;">
              © ${new Date().getFullYear()} Madan Mehandi Udhyog • Industrial Area, Phase 3, Sojat City, Rajasthan 306104
            </div>
          </div>
        `,
      });
      messageId = info.messageId;
    }

    await supabase.from('notification_logs').insert({
      recipient_email,
      template_name: 'smtp_test',
      template_title: 'SMTP Connection Test',
      subject: '✅ SMTP Connection Test Successful',
      body: `SMTP connection to ${host}:${port} verified and saved.`,
      status: 'sent',
      channel: 'email',
    });

    return res.status(200).json({
      success: true,
      message: `SMTP connection verified & saved to database! Test email delivered to ${recipient_email}.`,
      messageId,
    });
  } catch (err) {
    console.error('[API test-smtp] Error:', err);
    try {
      await supabase.from('notification_logs').insert({
        recipient_email: 'admin@system',
        template_name: 'smtp_test_failed',
        template_title: 'SMTP Connection Failed',
        subject: 'SMTP Connection Error',
        body: err.message || 'Unknown SMTP error',
        status: 'failed',
        error_message: err.message,
        channel: 'email',
      });
    } catch (_) {}

    return res.status(400).json({
      success: false,
      error: err.message || 'SMTP Connection failed.',
      code: err.code,
      hint:
        err.code === 'EAUTH'
          ? 'Authentication failed: If using Gmail, you MUST generate and use a Google "App Password" (16 characters), not your personal Google password.'
          : err.message,
    });
  }
}
