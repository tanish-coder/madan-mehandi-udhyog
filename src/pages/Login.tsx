import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  ShieldCheck,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile, signInWithGoogle, establishOtpSession } = useAuth();

  // Auth Mode: 'password' | 'email_otp'
  const [authMode, setAuthMode] = useState<'password' | 'email_otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');
  // isGoogleOtpFlow: true when user came through Google OAuth redirect with real session
  const [isGoogleOtpFlow, setIsGoogleOtpFlow] = useState(false);
  const [googleUserTemp, setGoogleUserTemp] = useState<any>(null);
  // isEmailOtpLoginFlow: true for plain Email-OTP login (not Google)
  const [isEmailOtpLoginFlow, setIsEmailOtpLoginFlow] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const googleOtpDispatchedRef = useRef(false);

  // Check if returning from Google OAuth or active session needing 2FA confirmation
  useEffect(() => {
    const checkGoogleRedirect = async () => {
      if (otpStep || googleOtpDispatchedRef.current) return;

      const hash = window.location.hash || '';
      const search = window.location.search || '';
      let pendingTs = 0;
      try {
        pendingTs = Number(localStorage.getItem('mmu_google_oauth_pending') || '0');
      } catch (_) {}

      const isGoogleReturn =
        (pendingTs > 0 && Date.now() - pendingTs < 10 * 60 * 1000) ||
        hash.includes('access_token=') ||
        hash === '#' ||
        search.includes('google_callback=true') ||
        search.includes('code=');

      if (!isGoogleReturn) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const activeUser = session?.user || user;
        if (!activeUser || !activeUser.email) return;

        googleOtpDispatchedRef.current = true;
        try {
          localStorage.removeItem('mmu_google_oauth_pending');
        } catch (_) {}

        const userEmail = activeUser.email.toLowerCase().trim();
        const fullName =
          activeUser.user_metadata?.full_name ||
          activeUser.user_metadata?.name ||
          'Valued Customer';

        setGoogleUserTemp(activeUser);
        setIsGoogleOtpFlow(true);
        setOtpSentEmail(userEmail);
        setOtpStep(true);
        setResendTimer(60);

        // Clean URL hash/query so refresh doesn't re-trigger
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, '/login');
        }

        // Prevent duplicate OTP dispatch within 12 seconds (React StrictMode protection)
        const lastSentKey = `mmu_last_otp_${userEmail}`;
        const lastSentTs = Number(sessionStorage.getItem(lastSentKey) || '0');
        if (Date.now() - lastSentTs < 12000) {
          return;
        }
        sessionStorage.setItem(lastSentKey, String(Date.now()));

        setLoading(true);
        const otpRes = await sendEmailOtp(userEmail, 'google_signin', fullName);
        if (otpRes.emailSent) {
          toast.success(`Google Account Confirmed! 6-digit OTP sent to ${userEmail}.`);
        } else {
          toast.error('Failed to send OTP email. Please check SMTP configuration.');
        }
      } catch (err: any) {
        console.error('Error handling Google OAuth redirect:', err);
      } finally {
        setLoading(false);
      }
    };

    checkGoogleRedirect();
  }, [user, otpStep, location.search]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const getSafeRedirectTarget = (role?: string) => {
    const rawFrom = (location.state as any)?.from?.pathname;
    const from =
      rawFrom && rawFrom !== '/login' && rawFrom !== '/register' ? rawFrom : null;
    if (role === 'admin') {
      return from || '/admin';
    }
    return from || '/';
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        toast.error(error.message || 'Failed to sign in. Please check credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success('Signed in successfully!');
        await handleRedirectAfterLogin(data.user.id, data.user.email);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Trigger
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        try {
          localStorage.removeItem('mmu_google_oauth_pending');
        } catch (_) {}

        // Google OAuth provider not configured — use Email+OTP as secure fallback
        const promptEmail =
          email.trim() || window.prompt('Enter your Google account email to sign in with OTP:');
        if (promptEmail && promptEmail.includes('@')) {
          const cleanEmail = promptEmail.toLowerCase().trim();
          setIsGoogleOtpFlow(true);
          setIsEmailOtpLoginFlow(true);
          setOtpSentEmail(cleanEmail);

          const otpRes = await sendEmailOtp(cleanEmail, 'google_signin');

          setOtpStep(true);
          setResendTimer(60);

          if (otpRes.emailSent) {
            toast.success(`Verification code sent to ${cleanEmail}!`);
          } else {
            toast.error('SMTP not configured. Please configure SMTP in Admin Settings to receive OTP.');
          }
        } else {
          toast.error('Google sign-in could not be initiated.');
        }
      }
      // If no error → Google OAuth redirect is happening (browser navigates away)
    } catch (err: any) {
      toast.error('Google sign-in error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send Email OTP (plain Email OTP login — no Google)
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const otpRes = await sendEmailOtp(cleanEmail, 'signin');

      setOtpSentEmail(cleanEmail);
      setIsEmailOtpLoginFlow(true);
      setOtpStep(true);
      setResendTimer(60);

      if (otpRes.emailSent) {
        toast.success(`6-digit verification code sent to ${cleanEmail}!`);
      } else {
        toast.error('SMTP not configured. Please configure SMTP in Admin Settings to receive OTP.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP — handles Google real OAuth, Google email fallback, and plain Email OTP login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const verifyRes = await verifyEmailOtp(
        otpSentEmail,
        cleanCode,
        isGoogleOtpFlow ? 'google_signin' : 'signin'
      );

      if (!verifyRes.success) {
        toast.error(verifyRes.message || 'Invalid or expired OTP code.');
        setLoading(false);
        return;
      }

      try {
        localStorage.removeItem('mmu_google_oauth_pending');
      } catch (_) {}

      // 1. Check if we have a real Supabase Auth user (from Google OAuth or existing session)
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const activeAuthUser = googleUserTemp || currentSession?.user || user;

      if (activeAuthUser && activeAuthUser.id && currentSession?.user) {
        toast.success('Sign-in verified! Welcome to Madan Mehandi Udhyog.');
        await upsertProfileAndRedirect(activeAuthUser);
        return;
      }

      // 2. Custom SMTP OTP flow (Email OTP tab or Google email fallback)
      const otpProfile = await establishOtpSession(otpSentEmail);
      toast.success('Sign-in verified! Welcome to Madan Mehandi Udhyog.');
      navigate(getSafeRedirectTarget(otpProfile.role), { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Helper: upsert profile row and redirect based on role
  const upsertProfileAndRedirect = async (authUser: any) => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', authUser.id)
        .maybeSingle();

      const cleanEmail = (authUser.email || otpSentEmail || '').toLowerCase().trim();
      const defaultRole =
        cleanEmail === 'admin@madanmehandi.com' || cleanEmail === 'rs5621614@gmail.com'
          ? 'admin'
          : 'customer';

      if (!existing) {
        await supabase.from('profiles').upsert(
          {
            id: authUser.id,
            email: cleanEmail,
            full_name:
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              cleanEmail.split('@')[0] ||
              'Customer',
            role: defaultRole,
            avatar_url:
              authUser.user_metadata?.avatar_url ||
              authUser.user_metadata?.picture ||
              null,
          },
          { onConflict: 'id' }
        );
      }

      await refreshProfile();
      const role = existing?.role || defaultRole;
      navigate(getSafeRedirectTarget(role), { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  const handleRedirectAfterLogin = async (userId: string, userEmail?: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      await refreshProfile();
      const cleanEmail = (userEmail || '').toLowerCase().trim();
      const role =
        profileData?.role ||
        (cleanEmail === 'admin@madanmehandi.com' || cleanEmail === 'rs5621614@gmail.com'
          ? 'admin'
          : 'customer');
      navigate(getSafeRedirectTarget(role), { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col md:flex-row">
      {/* Brand Hero Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-henna-950 via-earth-900 to-henna-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="leaf-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 5 C45 20 50 35 30 55 C10 35 15 20 30 5 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
          </svg>
        </div>

        {/* Top brand header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-henna-600 flex items-center justify-center shadow-lg font-bold text-xl text-white font-serif">
              M
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-wide text-henna-200">
                Madan Mehandi Udhyog
              </span>
              <p className="text-xs text-earth-300 font-medium">Sojat City, Rajasthan, India</p>
            </div>
          </div>
        </div>

        {/* Center message */}
        <div className="relative z-10 max-w-lg my-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-henna-800/80 border border-henna-700/60 text-xs font-semibold text-henna-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-henna-400" />
            Pure Sojat Henna Heritage
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
            Rooted in Tradition. <br />
            <span className="text-henna-400">Trusted Worldwide.</span>
          </h2>
          <p className="text-earth-200 text-base leading-relaxed mb-6">
            Connecting Sojat’s celebrated micro-fine Lawsonia Inermis henna and Ayurvedic botanical powders with businesses and connoisseurs across the globe.
          </p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-henna-400 font-bold block text-sm">₹299 / 100 gm</span>
              <span className="text-earth-300">Uniform transparent pricing</span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-henna-400 font-bold block text-sm">15 Ayurvedic Powders</span>
              <span className="text-earth-300">Pure, lab-tested, triple-sifted</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-earth-400">
          &copy; {new Date().getFullYear()} Madan Mehandi Udhyog (MMU). All rights reserved.
        </div>
      </div>

      {/* Login Form Right Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="md:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-henna-600 text-white font-bold text-2xl font-serif mb-2 shadow-md">
              M
            </div>
            <h1 className="font-display text-2xl font-bold text-henna-900">Madan Mehandi Udhyog</h1>
            <p className="text-xs text-earth-600">Sojat City, Rajasthan</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {otpStep ? 'Verify Security OTP' : 'Sign In'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {otpStep
                    ? `Enter the 6-digit code for ${otpSentEmail}`
                    : 'Access your customer account or admin portal'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-henna-50 border border-henna-200 flex items-center justify-center text-henna-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* ─── STEP 2: OTP VERIFICATION VIEW ─── */}
            {otpStep ? (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="p-4 bg-henna-50/70 border border-henna-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-henna-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-henna-700" />
                      {isGoogleOtpFlow ? 'Google Account Confirmed' : 'Verification Code Sent'}
                    </span>
                    <span className="text-[11px] font-medium text-henna-700 bg-white px-2 py-0.5 rounded border border-henna-200">
                      Check Email
                    </span>
                  </div>
                  <p className="text-gray-600">
                    A 6-digit one-time passcode was sent to <strong>{otpSentEmail}</strong>. Please check your inbox and enter it below to confirm sign-in.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3.5 rounded-2xl border-2 border-henna-300 focus:border-henna-600 focus:outline-none focus:ring-4 focus:ring-henna-100 transition font-bold text-gray-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-henna-600 hover:bg-henna-700 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Complete Sign In</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setIsGoogleOtpFlow(false);
                      setIsEmailOtpLoginFlow(false);
                      setOtpCode('');
                      setGoogleUserTemp(null);
                    }}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0 || loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // Re-trigger Supabase OTP for session creation
                        await supabase.auth.signInWithOtp({
                          email: otpSentEmail,
                          options: { shouldCreateUser: true },
                        });
                        // Resend our custom SMTP OTP
                        const otpRes = await sendEmailOtp(
                          otpSentEmail,
                          isGoogleOtpFlow ? 'google_signin' : 'signin'
                        );
                        setResendTimer(60);
                        setOtpCode('');
                        if (otpRes.emailSent) {
                          toast.success(`New verification code sent to ${otpSentEmail}!`);
                        } else {
                          toast.error('Failed to dispatch OTP email. Please check your SMTP settings.');
                        }
                      } catch (err: any) {
                        toast.error('Failed to resend OTP');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-henna-700 font-semibold hover:underline disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            ) : (
              /* ─── STEP 1: LOGIN METHOD SELECTOR & FORMS ─── */
              <div className="space-y-6">
                {/* 1. Google One-Click Sign In Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-xs hover:shadow group"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-1.5">
                    Fast sign-in with automatic 2FA security confirmation
                  </p>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-200 w-full" />
                  <span className="bg-white px-3 text-xs text-gray-400 uppercase font-medium">Or</span>
                </div>

                {/* Auth Mode Toggle Tabs */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAuthMode('password')}
                    className={`py-2 text-xs font-bold rounded-lg transition ${
                      authMode === 'password'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Password Sign-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('email_otp')}
                    className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                      authMode === 'email_otp'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-henna-600" />
                    <span>Email OTP Code</span>
                  </button>
                </div>

                {/* Password Mode Form */}
                {authMode === 'password' && (
                  <>
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Password
                          </label>
                          <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-henna-600 hover:text-henna-700 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-henna-600 hover:bg-henna-700 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Signing in...</span>
                          </>
                        ) : (
                          <>
                            <span>Sign In to Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}

                {/* Email OTP Mode Form */}
                {authMode === 'email_otp' && (
                  <form onSubmit={handleSendEmailOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                        Your Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. yourname@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-henna-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        We will send a 6-digit confirmation code directly to this email
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full bg-henna-600 hover:bg-henna-700 active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating OTP...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Send 6-Digit OTP Code</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer link to register */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Need a wholesale account?</span>
                  <Link to="/register" className="font-semibold text-henna-600 hover:underline">
                    Register here
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
