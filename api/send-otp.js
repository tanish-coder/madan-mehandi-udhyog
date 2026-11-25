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
    console.error('[API send-otp] Error fetching smtp_settings from Supabase:', err);
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
    const { email, purpose = 'signin', customerName = 'Valued Customer' } = body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbErr } = await supabase.from('email_otps').insert({
      email: cleanEmail,
      otp: otpCode,
      purpose,
      expires_at: expiresAt,
      verified: false,
    });

    if (dbErr) {
      console.error('[API send-otp] Supabase email_otps insert error:', dbErr);
    }

    const smtp = await getStoredOrEnvSmtpSettings();
    let emailSent = false;
    let emailErr = null;

    if (smtp.host && smtp.username && smtp.password) {
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
          to: cleanEmail,
          subject: `${otpCode} is your Madan Mehandi Udhyog verification code`,
          text: `Hello ${customerName},\n\nYour 6-digit verification code for Madan Mehandi Udhyog is:\n\n${otpCode}\n\nThis security code expires in 10 minutes. Please enter it to complete your ${
            purpose === 'register' ? 'account registration' : 'sign-in'
          }.\n\nIf you did not request this, please ignore this email.\n\nMadan Mehandi Udhyog, Sojat City, Rajasthan`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background-color: #551b14; color: #ffffff; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 19px; letter-spacing: 1px;">Madan Mehandi Udhyog</h1>
                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Pure Sojat Henna • Account Verification</p>
              </div>
              <div style="padding: 24px; color: #2d3748; text-align: center;">
                <p style="font-size: 14px; color: #4a5568; margin-top: 0;">
                  ${purpose === 'register' ? 'Welcome to Madan Mehandi Udhyog! Please verify your email to activate your account:' : 'Use the 6-digit verification code below to complete your sign-in:'}
                </p>
                <div style="background-color: #f7fafc; border: 2px dashed #cbd5e0; border-radius: 12px; padding: 18px; margin: 20px auto; max-width: 260px;">
                  <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #551b14;">
                    ${otpCode}
                  </span>
                </div>
                <p style="font-size: 12px; color: #718096; margin-bottom: 4px;">
                  ⏱️ This security code expires in <strong>10 minutes</strong>.
                </p>
                <p style="font-size: 11px; color: #a0aec0; margin: 0;">
                  Do not share this code with anyone. Our team will never ask for your verification code.
                </p>
              </div>
              <div style="background-color: #edf2f7; padding: 12px; text-align: center; font-size: 11px; color: #718096;">
                © ${new Date().getFullYear()} Madan Mehandi Udhyog • Sojat City, Rajasthan
              </div>
            </div>
          `,
        });
        emailSent = true;
      } catch (sendErr) {
        console.warn('[API send-otp] Could not send via SMTP:', sendErr.message);
        emailErr = sendErr.message;
      }
    }

    await supabase.from('notification_logs').insert({
      recipient_email: cleanEmail,
      template_name: 'otp_verification',
      template_title: 'Sign-In Security OTP',
      subject: `${otpCode} is your Madan Mehandi Udhyog verification code`,
      body: `OTP code generated for ${purpose}`,
      status: emailSent ? 'sent' : 'failed',
      error_message: emailErr,
      channel: 'email',
    });

    return res.status(200).json({
      success: true,
      message: emailSent
        ? `6-digit verification OTP has been sent to ${cleanEmail}`
        : `Verification code generated for ${cleanEmail}. Configure SMTP to deliver via email.`,
      emailSent,
    });
  } catch (err) {
    console.error('[API send-otp] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
