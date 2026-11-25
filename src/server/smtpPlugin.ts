import type { Plugin, ViteDevServer } from 'vite';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://evbuchyepfjaxkeekxdm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YnVjaHllcGZqYXhrZWVreGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTc1OTksImV4cCI6MjExMDkzMzU5OX0.0AAYwjOvchdHRpZh5p1xYIyrw0AzOWomXq07xp9RxtU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJsonResponse(res: any, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function getStoredSmtpSettings() {
  const envDefaults = {
    host: process.env.SMTP_HOST || process.env.VITE_SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || process.env.VITE_SMTP_PORT || 587),
    username: process.env.SMTP_USER || process.env.VITE_SMTP_USER || 'rs5621614@gmail.com',
    password: process.env.SMTP_PASS || process.env.VITE_SMTP_PASS || '',
    from_email:
      process.env.SMTP_FROM_EMAIL ||
      process.env.VITE_SMTP_FROM_EMAIL ||
      process.env.SMTP_USER ||
      process.env.VITE_SMTP_USER ||
      'rs5621614@gmail.com',
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
    console.error('[SMTP Plugin] Error fetching smtp_settings from Supabase:', err);
  }
  return envDefaults;
}

export function smtpServerPlugin(): Plugin {
  return {
    name: 'mmu-smtp-server-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. POST /api/test-smtp
        if (req.method === 'POST' && url === '/api/test-smtp') {
          try {
            const stored = await getStoredSmtpSettings();
            const body = await parseJsonBody(req);
            const host = body.host || stored.host || 'smtp.gmail.com';
            const port = body.port || stored.port || 587;
            const username = body.username || stored.username || '';
            const password = body.password || stored.password || '';
            const encryption = body.encryption || stored.encryption || 'tls';
            const from_email = body.from_email || stored.from_email || username || 'orders@madanmehandi.com';
            const from_name = body.from_name || stored.from_name || 'Madan Mehandi Udhyog';
            const recipient_email = body.recipient_email || from_email || username;

            const portNum = Number(port) || 587;
            const isSecure = encryption === 'ssl' || portNum === 465;

            if (host && username && password) {
              try {
                await supabase.from('settings').upsert(
                  {
                    key: 'smtp_settings',
                    value: {
                      ...stored,
                      host,
                      port: portNum,
                      username,
                      password,
                      encryption,
                      from_email,
                      from_name,
                      is_enabled: true,
                    },
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'key' }
                );
              } catch (_) {}
            }

            console.log(`[SMTP Plugin] Testing connection to ${host}:${portNum} for user: ${username}`);

            const transporter = nodemailer.createTransport({
              host,
              port: portNum,
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

            // Verify connection
            await transporter.verify();
            console.log(`[SMTP Plugin] Verify successful for ${host}:${portNum}`);

            // If recipient specified, send test email
            let messageId = null;
            if (recipient_email && recipient_email.includes('@')) {
              const info = await transporter.sendMail({
                from: `"${from_name}" <${from_email || username}>`,
                to: recipient_email,
                subject: '✅ SMTP Connection Test Successful — Madan Mehandi Udhyog',
                text: `Hello!\n\nThis is a confirmation that your SMTP server connection (${host}:${portNum}) is active and verified.\n\nSender: ${from_name} <${from_email}>\nRecipient: ${recipient_email}\nDate: ${new Date().toLocaleString('en-IN')}\n\nMadan Mehandi Udhyog, Sojat City, Rajasthan`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #551b14; color: #ffffff; padding: 22px; text-align: center;">
                      <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: bold;">Madan Mehandi Udhyog</h1>
                      <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Pure Sojat Henna Since 1990 • SMTP Gateway Test</p>
                    </div>
                    <div style="padding: 26px; color: #2d3748; line-height: 1.6;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                        <span style="font-size: 22px;">✅</span>
                        <h2 style="color: #22543d; margin: 0; font-size: 18px;">SMTP Connection Verified & Active!</h2>
                      </div>
                      <p style="font-size: 14px; margin-top: 0;">
                        Congratulations! Your mail server credentials have been verified and this test email was successfully dispatched.
                      </p>
                      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; background-color: #f7fafc; border-radius: 8px; padding: 12px;">
                        <tr><td style="padding: 8px; color: #718096; width: 140px;">Host / Server:</td><td style="padding: 8px; font-weight: bold;">${host}</td></tr>
                        <tr><td style="padding: 8px; color: #718096;">Port & Protocol:</td><td style="padding: 8px; font-weight: bold;">${portNum} (${encryption.toUpperCase()})</td></tr>
                        <tr><td style="padding: 8px; color: #718096;">Username:</td><td style="padding: 8px; font-weight: bold;">${username || '(anonymous)'}</td></tr>
                        <tr><td style="padding: 8px; color: #718096;">From Sender:</td><td style="padding: 8px; font-weight: bold;">${from_name} &lt;${from_email || username}&gt;</td></tr>
                        <tr><td style="padding: 8px; color: #718096;">Recipient:</td><td style="padding: 8px; font-weight: bold;">${recipient_email}</td></tr>
                        <tr><td style="padding: 8px; color: #718096;">Dispatched At:</td><td style="padding: 8px; font-weight: bold;">${new Date().toLocaleString('en-IN')}</td></tr>
                      </table>
                      <div style="background-color: #f0fff4; padding: 14px; border-radius: 8px; border-left: 4px solid #38a169; font-size: 13px; color: #22543d;">
                        Real-time customer notifications for <strong>Order Confirmations</strong>, <strong>Payment Receipts</strong>, and <strong>Security OTPs</strong> will now be automatically sent to customers.
                      </div>
                    </div>
                    <div style="background-color: #edf2f7; padding: 14px; text-align: center; font-size: 11px; color: #718096;">
                      © ${new Date().getFullYear()} Madan Mehandi Udhyog • Industrial Area, Phase 3, Sojat City, Rajasthan 306104
                    </div>
                  </div>
                `,
              });
              messageId = info.messageId;
              console.log(`[SMTP Plugin] Test email sent to ${recipient_email}. MessageId:`, messageId);
            }

            // Log to Supabase notification_logs table
            await supabase.from('notification_logs').insert({
              recipient_email,
              template_name: 'smtp_test',
              template_title: 'SMTP Connection Test',
              subject: '✅ SMTP Connection Test Successful',
              body: `SMTP connection to ${host}:${portNum} verified.`,
              status: 'sent',
              channel: 'email',
            });

            return sendJsonResponse(res, 200, {
              success: true,
              message: `SMTP connection verified successfully! Test email delivered to ${recipient_email}.`,
              messageId,
            });
          } catch (err: any) {
            console.error('[SMTP Plugin] Test failed:', err);

            // Log error
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

            return sendJsonResponse(res, 400, {
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

        // 2. POST /api/send-otp
        if (req.method === 'POST' && url === '/api/send-otp') {
          try {
            const body = await parseJsonBody(req);
            const { email, purpose = 'signin', customerName = 'Valued Customer' } = body;

            if (!email || !email.includes('@')) {
              return sendJsonResponse(res, 400, { success: false, message: 'Valid email required' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const otpCode = String(Math.floor(100000 + Math.random() * 900000));
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

            // Store in Supabase email_otps table
            const { error: dbErr } = await supabase.from('email_otps').insert({
              email: cleanEmail,
              otp: otpCode,
              purpose,
              expires_at: expiresAt,
              verified: false,
            });

            if (dbErr) {
              console.error('[SMTP Plugin] Supabase email_otps insert error:', dbErr);
            }

            // Attempt sending email via configured SMTP
            const smtp = await getStoredSmtpSettings();
            let emailSent = false;
            let emailErr: string | null = null;

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
                console.log(`[SMTP Plugin] Real OTP email sent to ${cleanEmail}`);
              } catch (sendErr: any) {
                console.warn('[SMTP Plugin] Could not send via SMTP:', sendErr.message);
                emailErr = sendErr.message;
              }
            } else {
              console.log(`[SMTP Plugin] SMTP credentials not configured. OTP stored in DB for ${cleanEmail}.`);
            }

            // Log dispatch in notification_logs
            await supabase.from('notification_logs').insert({
              recipient_email: cleanEmail,
              template_name: 'otp_verification',
              template_title: 'Sign-In Security OTP',
              subject: `${otpCode} is your Madan Mehandi Udhyog verification code`,
              body: `OTP code ${otpCode} generated for ${purpose}`,
              status: emailSent ? 'sent' : 'simulated',
              error_message: emailErr,
              channel: 'email',
            });

            return sendJsonResponse(res, 200, {
              success: true,
              message: emailSent
                ? `6-digit verification OTP has been sent to ${cleanEmail}`
                : `Verification code generated for ${cleanEmail}. Configure SMTP to deliver via email.`,
              emailSent,
            });
          } catch (err: any) {
            console.error('[SMTP Plugin] send-otp error:', err);
            return sendJsonResponse(res, 500, { success: false, message: err.message });
          }
        }

        // 3. POST /api/verify-otp
        if (req.method === 'POST' && url === '/api/verify-otp') {
          try {
            const body = await parseJsonBody(req);
            const { email, otp } = body;

            if (!email || !otp) {
              return sendJsonResponse(res, 400, { success: false, message: 'Email and OTP code are required.' });
            }

            const cleanEmail = email.toLowerCase().trim();
            const cleanOtp = String(otp).trim();

            // Check Supabase email_otps table
            const { data, error } = await supabase
              .from('email_otps')
              .select('*')
              .eq('email', cleanEmail)
              .eq('otp', cleanOtp)
              .eq('verified', false)
              .gt('expires_at', new Date().toISOString())
              .order('created_at', { ascending: false })
              .limit(1);

            if (error) {
              console.error('[SMTP Plugin] verify-otp query error:', error);
            }

            if (data && data.length > 0) {
              // Mark as verified
              await supabase
                .from('email_otps')
                .update({ verified: true })
                .eq('id', data[0].id);

              return sendJsonResponse(res, 200, {
                success: true,
                message: 'Email address verified successfully!',
              });
            } else {
              return sendJsonResponse(res, 400, {
                success: false,
                message: 'Invalid or expired verification code. Please check your email and try again.',
              });
            }
          } catch (err: any) {
            console.error('[SMTP Plugin] verify-otp error:', err);
            return sendJsonResponse(res, 500, { success: false, message: err.message });
          }
        }

        // 4. POST /api/send-email
        if (req.method === 'POST' && url === '/api/send-email') {
          try {
            const body = await parseJsonBody(req);
            const { to, subject, html, text, template_name, order_id, payment_id } = body;

            if (!to || !to.includes('@')) {
              return sendJsonResponse(res, 400, { success: false, message: 'Recipient email required' });
            }

            const smtp = await getStoredSmtpSettings();
            let emailSent = false;
            let errorMsg = null;

            if (smtp.is_enabled && smtp.host && smtp.username && smtp.password) {
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
              } catch (err: any) {
                console.error('[SMTP Plugin] send-email failure:', err);
                errorMsg = err.message;
              }
            }

            // Always log in notification_logs table
            await supabase.from('notification_logs').insert({
              recipient_email: to,
              template_name: template_name || 'general',
              template_title: subject,
              subject,
              body: text || html || '',
              order_id,
              payment_id,
              status: emailSent ? 'sent' : 'simulated',
              error_message: errorMsg,
              channel: 'email',
            });

            return sendJsonResponse(res, 200, {
              success: true,
              emailSent,
              message: emailSent ? `Email delivered to ${to}` : `Notification recorded for ${to}`,
            });
          } catch (err: any) {
            return sendJsonResponse(res, 500, { success: false, message: err.message });
          }
        }

        next();
      });
    },
  };
}
