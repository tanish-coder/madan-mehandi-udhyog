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
    console.error('[API send-email] Error fetching smtp_settings from Supabase:', err);
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
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { to, subject, html, text, template_name, order_id, payment_id } = body;

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, message: 'Recipient email required' });
    }

    const smtp = await getStoredOrEnvSmtpSettings();
    let emailSent = false;
    let errorMsg = null;

    if (smtp.is_enabled !== false && smtp.host && smtp.username && smtp.password) {
      try {
        const isSecure = smtp.encryption === 'ssl' || Number(smtp.port) === 465;
        const transporter = nodemailer.createTransport({
          host: smtp.host,
          port: Number(smtp.port) || 587,
          secure: isSecure,
          auth: { user: smtp.username, pass: smtp.password },
          tls: { rejectUnauthorized: false, minVersion: 'TLSv1.2' },
          connectionTimeout: 10000,
        });

        await transporter.sendMail({
          from: `"${smtp.from_name || 'Madan Mehandi Udhyog'}" <${smtp.from_email || smtp.username}>`,
          to,
          subject,
          text: text || '',
          html: html || `<p style="white-space: pre-wrap;">${text}</p>`,
        });
        emailSent = true;
      } catch (err) {
        console.error('[API send-email] Send failure:', err);
        errorMsg = err.message;
      }
    }

    await supabase.from('notification_logs').insert({
      recipient_email: to,
      template_name: template_name || 'general',
      template_title: subject,
      subject,
      body: text || html || '',
      order_id,
      payment_id,
      status: emailSent ? 'sent' : 'failed',
      error_message: errorMsg,
      channel: 'email',
    });

    return res.status(200).json({
      success: true,
      emailSent,
      message: emailSent ? `Email delivered to ${to}` : `Notification recorded for ${to}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
