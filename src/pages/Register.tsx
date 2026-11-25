import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { sendEmailOtp, verifyEmailOtp } from '../lib/otp';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { signInWithGoogle, refreshProfile, establishOtpSession } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  // Step 1: Submit Form & Dispatch OTP to email
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = form.email.toLowerCase().trim();
      const otpRes = await sendEmailOtp(cleanEmail, 'register', form.full_name.trim());

      setOtpStep(true);
      setResendTimer(60);

      if (otpRes.emailSent) {
        toast.success(`6-digit verification code sent to ${cleanEmail}!`);
      } else {
        toast.error('Failed to dispatch verification email. Please check SMTP settings.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const cleanEmail = form.email.toLowerCase().trim();
      await sendEmailOtp(cleanEmail, 'register', form.full_name.trim());
      setResendTimer(60);
      toast.success(`A fresh verification code was sent to ${cleanEmail}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize Account Creation
  const handleVerifyAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = form.email.toLowerCase().trim();
      const verifyRes = await verifyEmailOtp(cleanEmail, cleanCode, 'register');

      if (!verifyRes.success) {
        toast.error(verifyRes.message || 'Invalid or expired OTP code.');
        setLoading(false);
        return;
      }

      toast.success('Email verified successfully! Activating your MMU account...');

      const passwordToUse =
        form.password && form.password.length >= 6
          ? form.password
          : `Mmu@${Math.random().toString(36).slice(-8)}1A`;

      // Finalize Supabase Auth Sign Up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: passwordToUse,
        options: {
          data: {
            full_name: form.full_name.trim() || cleanEmail.split('@')[0],
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          // Try signing in with provided password if already registered
          if (form.password) {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: form.password,
            });
          }
        } else {
          console.warn('Supabase signUp notice:', error.message);
        }
      }

      if (data?.user) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: data.user.id,
              email: cleanEmail,
              full_name: form.full_name.trim() || cleanEmail.split('@')[0],
              role: 'customer',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (_) {}
      }

      // Check if an active Supabase session was created; otherwise establish verified OTP session
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      if (activeSession?.user) {
        await refreshProfile();
      } else {
        await establishOtpSession(cleanEmail, form.full_name.trim() || cleanEmail.split('@')[0]);
      }

      toast.success('Account created & verified! Welcome to Madan Mehandi Udhyog.');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        // Fallback: prompt for Google email and send OTP
        const promptEmail = form.email.trim() || window.prompt('Enter your Google email to register:');
        if (promptEmail && promptEmail.includes('@')) {
          setForm((prev) => ({ ...prev, email: promptEmail }));
          const otpRes = await sendEmailOtp(promptEmail.toLowerCase().trim(), 'register');
          setOtpStep(true);
          setResendTimer(60);
          if (otpRes.emailSent) {
            toast.success(`Verification code dispatched to ${promptEmail}`);
          } else {
            toast.error('Failed to dispatch verification code. Please check SMTP settings.');
          }
        } else {
          toast.error('Google sign-up could not be initiated.');
        }
      }
    } catch (err: any) {
      toast.error('Google sign-up error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 w-full max-w-md space-y-6">
        {/* OTP Verification Screen */}
        {otpStep ? (
          <form onSubmit={handleVerifyAndCreateAccount} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-henna-50 border border-henna-200 text-henna-600 flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Email Address</span>
              </div>

              <h2 className="font-display text-2xl font-bold text-gray-900">
                Confirm Your Account
              </h2>

              <p className="text-xs text-gray-600 leading-relaxed">
                We have dispatched a 6-digit security code to:
                <br />
                <span className="font-semibold text-gray-900 font-mono text-sm">{form.email}</span>
              </p>
            </div>

            {/* 6-Digit Code Input */}
            <div className="space-y-2">
              <label className="label text-center block mb-1">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 px-4 rounded-xl border-2 border-gray-200 focus:border-henna-600 focus:ring-4 focus:ring-henna-100 transition outline-hidden font-bold text-gray-900 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Resend Timer */}
            <div className="text-center text-xs text-gray-500">
              {resendTimer > 0 ? (
                <span className="inline-flex items-center gap-1 text-gray-400">
                  Resend code in <strong className="text-gray-700">{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-henna-600 hover:text-henna-800 font-bold inline-flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-henna-600 hover:bg-henna-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify & Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1 font-medium transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to edit account details</span>
              </button>
            </div>
          </form>
        ) : (
          /* Account Registration Form */
          <>
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-henna-100 text-henna-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-henna-600" />
                <span>Join MMU Sojat</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-xs text-gray-500">
                Access wholesale rates, order tracking, and custom formulations
              </p>
            </div>

            {/* Google One-Click Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-xs text-gray-400 uppercase font-medium">
                Or register with email
              </span>
            </div>

            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="input pl-10"
                    type="text"
                    placeholder="e.g. Priya Choudhary"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="input pl-10"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    className="input pl-10 pr-10"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm_password}
                  onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-henna-600 hover:bg-henna-700 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code & Continue'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
              Already have an account?{' '}
              <Link to="/login" className="text-henna-600 hover:underline font-bold">
                Sign In here
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
