import { supabase } from './supabase';

export interface OtpSendResult {
  success: boolean;
  message: string;
  emailSent?: boolean;
}

export interface OtpVerifyResult {
  success: boolean;
  message: string;
}

/**
 * Dispatch a 6-digit OTP to the customer's email address
 */
export async function sendEmailOtp(
  email: string,
  purpose: 'signin' | 'google_signin' | 'register' = 'signin',
  customerName: string = 'Valued Customer'
): Promise<OtpSendResult> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Try our backend SMTP service endpoint
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        purpose,
        customerName,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[OTP Service] /api/send-otp unavailable, using Supabase direct fallback:', err);
  }

  // 2. Direct Supabase database fallback
  try {
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase.from('email_otps').insert({
      email: cleanEmail,
      otp: generatedOtp,
      purpose,
      expires_at: expiresAt,
      verified: false,
    });

    if (error) {
      console.error('[OTP Service] Supabase email_otps insert error:', error);
    }

    return {
      success: true,
      message: `Verification code generated for ${cleanEmail}`,
      emailSent: false,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to dispatch verification code.',
    };
  }
}

/**
 * Verify a 6-digit OTP entered by the user
 */
export async function verifyEmailOtp(
  email: string,
  otp: string,
  purpose?: string
): Promise<OtpVerifyResult> {
  if (!email || !otp) {
    return { success: false, message: 'Email and verification code are required.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  // 1. Try backend verification API
  try {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        otp: cleanOtp,
        purpose,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    }
  } catch (err) {
    console.warn('[OTP Service] /api/verify-otp unavailable, using Supabase direct fallback:', err);
  }

  // 2. Direct Supabase database fallback
  try {
    const { data, error } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', cleanEmail)
      .eq('otp', cleanOtp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      await supabase
        .from('email_otps')
        .update({ verified: true })
        .eq('id', data[0].id);

      return { success: true, message: 'Email address verified successfully!' };
    }

    return {
      success: false,
      message: 'Invalid or expired verification code. Please check your email and try again.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to verify OTP code.',
    };
  }
}
