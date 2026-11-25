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
    const { email, otp } = body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

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
      console.error('[API verify-otp] Query error:', error);
    }

    if (data && data.length > 0) {
      await supabase
        .from('email_otps')
        .update({ verified: true })
        .eq('id', data[0].id);

      return res.status(200).json({
        success: true,
        message: 'Email address verified successfully!',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please check your email and try again.',
      });
    }
  } catch (err) {
    console.error('[API verify-otp] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
