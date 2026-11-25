import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getR2Config, saveR2Config, type R2Config } from '../../lib/r2';
import {
  NotificationTemplate,
  SmtpSettings,
  NotificationLogEntry,
  DEFAULT_TEMPLATES,
  DEFAULT_SMTP,
  saveNotificationTemplates,
  saveSmtpSettings,
  getNotificationLogs,
  dispatchTestNotification,
  testSmtpConnection,
  clearNotificationLogs,
  renderTemplate,
} from '../../lib/notifications';
import toast from 'react-hot-toast';
import {
  Settings,
  Building2,
  Truck,
  CreditCard,
  ShoppingBag,
  Database,
  Save,
  Globe,
  MapPin,
  Phone,
  Mail,
  Bell,
  Send,
  Server,
  Zap,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Plus,
  Trash2,
  Filter,
  Sparkles,
  Sliders,
  X,
  ArrowUpRight,
  Info,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Loader2,
  RefreshCw,
  UploadCloud,
  Eye,
  EyeOff,
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'business' | 'shipping' | 'payment' | 'notifications' | 'r2' | 'database'>('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showR2Secret, setShowR2Secret] = useState(false);

  // Cloudflare R2 Bucket Config state
  const [r2Settings, setR2Settings] = useState<R2Config>(getR2Config());

  // Business info form
  const [businessInfo, setBusinessInfo] = useState({
    name: 'Madan Mehandi Udhyog (MMU)',
    tagline: 'Pure Sojat Henna. Trusted Worldwide.',
    address: 'Industrial Area, 3rd Phase, Sojat City, Rajasthan 306104, India',
    phone: '+91 94141 12345',
    email: 'contact@madanmehandi.com',
    whatsapp: '+91 94141 12345',
    google_reviews_url: 'https://maps.google.com/?q=Sojat+City+Rajasthan',
    google_maps_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57500!2d73.66!3d25.92!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394200c5c8e3cf3b%3A0xb35a7be3c41!2sSojat%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1',
    facebook: 'https://facebook.com/madanmehandi',
    instagram: 'https://instagram.com/madanmehandi',
    twitter: 'https://twitter.com/madanmehandi',
    linkedin: 'https://linkedin.com/company/madanmehandi',
  });

  // Shipping & commercial settings
  const [shippingSettings, setShippingSettings] = useState({
    base_shipping: 50,
    free_shipping_threshold: 999,
    gst_rate: 5,
    min_order_amount: 299,
    cod_enabled: true,
    online_payment_enabled: true,
  });

  // Notification templates & SMTP configuration state
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<
    'order_confirmation' | 'payment_confirmation' | 'otp_verification' | 'welcome_customer'
  >('order_confirmation');
  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>(DEFAULT_SMTP);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogEntry[]>([]);
  const [notifSubTab, setNotifSubTab] = useState<'templates' | 'smtp' | 'logs'>('templates');
  const [showSmtpSecret, setShowSmtpSecret] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState('orders@madanmehandi.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<NotificationLogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'order_confirmation' | 'payment_confirmation' | 'otp_verification'>('all');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
    error?: string;
    hint?: string;
  } | null>(null);
  const [smtpTestRecipient, setSmtpTestRecipient] = useState('orders@madanmehandi.com');

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (
      tabParam === 'notifications' ||
      tabParam === 'business' ||
      tabParam === 'shipping' ||
      tabParam === 'payment' ||
      tabParam === 'r2' ||
      tabParam === 'database'
    ) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const switchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'business' ? {} : { tab });
  };

  // Database stats
  const [dbStats, setDbStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    enquiriesCount: 0,
    manufacturingCount: 0,
    reviewsCount: 0,
    customersCount: 0,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      if (data) {
        data.forEach((row: any) => {
          if (row.key === 'business_info' && row.value) {
            setBusinessInfo((prev) => ({ ...prev, ...row.value }));
          }
          if (row.key === 'shipping_settings' && row.value) {
            setShippingSettings((prev) => ({ ...prev, ...row.value }));
          }
          if (row.key === 'r2_settings' && row.value) {
            setR2Settings((prev) => ({ ...prev, ...row.value }));
            saveR2Config(row.value);
          }
          if (row.key === 'notification_templates' && row.value) {
            setNotificationTemplates(row.value);
          }
          if (row.key === 'smtp_settings' && row.value) {
            setSmtpSettings((prev) => ({ ...prev, ...row.value }));
          }
          if (row.key === 'notifications_log' && row.value) {
            setNotificationLogs(row.value);
          }
        });
      }

      // Fetch database counts
      const [pRes, oRes, eRes, mRes, rRes, uRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('manufacturing_enquiries').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);

      setDbStats({
        productsCount: pRes.count ?? 15,
        ordersCount: oRes.count ?? 0,
        enquiriesCount: eRes.count ?? 0,
        manufacturingCount: mRes.count ?? 0,
        reviewsCount: rRes.count ?? 0,
        customersCount: uRes.count ?? 0,
      });
    } catch (err: any) {
      toast.error('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'business_info',
            value: businessInfo,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) throw error;
      toast.success('Business info saved to Supabase!');
    } catch (err: any) {
      toast.error('Failed to save business info: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'shipping_settings',
            value: shippingSettings,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) throw error;
      toast.success('Shipping & commercial settings saved to Supabase!');
    } catch (err: any) {
      toast.error('Failed to save shipping settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveR2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      saveR2Config(r2Settings);
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'r2_settings',
            value: r2Settings,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) throw error;
      toast.success('Cloudflare R2 Bucket settings saved!');
    } catch (err: any) {
      toast.error('Failed to save R2 settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Current active notification template
  const currentTemplate =
    notificationTemplates.find((t) => t.name === selectedTemplateKey) ||
    notificationTemplates[0] ||
    DEFAULT_TEMPLATES[0];

  const updateCurrentTemplate = (patch: Partial<NotificationTemplate>) => {
    setNotificationTemplates((prev) =>
      prev.map((t) =>
        t.name === selectedTemplateKey
          ? { ...t, ...patch, updated_at: new Date().toISOString() }
          : t
      )
    );
  };

  const handleSaveTemplates = async () => {
    setSavingTemplates(true);
    try {
      await saveNotificationTemplates(notificationTemplates);
      toast.success('Notification templates saved to Supabase in real-time!');
    } catch (err: any) {
      toast.error('Failed to save templates: ' + err.message);
    } finally {
      setSavingTemplates(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    try {
      await saveSmtpSettings(smtpSettings);
      toast.success('SMTP server settings saved to Supabase in real-time!');
    } catch (err: any) {
      toast.error('Failed to save SMTP: ' + err.message);
    } finally {
      setSavingSmtp(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    setTestingSmtp(true);
    setSmtpTestResult(null);
    try {
      const res = await testSmtpConnection(smtpSettings, smtpTestRecipient);
      setSmtpTestResult(res);
      if (res.success) {
        toast.success(res.message);
        const logs = await getNotificationLogs();
        setNotificationLogs(logs);
      } else {
        toast.error(res.error || res.message || 'SMTP connection failed.');
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Connection test failed',
        error: err.message,
      });
      toast.error('SMTP test error: ' + err.message);
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      toast.error('Please enter a valid recipient email address.');
      return;
    }
    setSendingTest(true);
    try {
      const res = await dispatchTestNotification({
        templateName: selectedTemplateKey,
        recipientEmail: testRecipient,
        customSubject: currentTemplate?.subject,
        customBody: currentTemplate?.body,
      });

      if (res.success) {
        toast.success(res.message);
        const logs = await getNotificationLogs();
        setNotificationLogs(logs);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error('Test notification failed: ' + err.message);
    } finally {
      setSendingTest(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all notification logs from Supabase?')) return;
    try {
      await clearNotificationLogs();
      setNotificationLogs([]);
      toast.success('Notification logs cleared!');
    } catch (err: any) {
      toast.error('Failed to clear logs: ' + err.message);
    }
  };

  const applySmtpPreset = (preset: 'gmail' | 'outlook' | 'sendgrid' | 'ses') => {
    if (preset === 'gmail') {
      setSmtpSettings((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        encryption: 'tls',
      }));
      toast.success('Gmail SMTP preset applied (Port 587, TLS)');
    } else if (preset === 'outlook') {
      setSmtpSettings((prev) => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        encryption: 'tls',
      }));
      toast.success('Outlook / Office 365 preset applied (Port 587, TLS)');
    } else if (preset === 'sendgrid') {
      setSmtpSettings((prev) => ({
        ...prev,
        host: 'smtp.sendgrid.net',
        port: 587,
        username: 'apikey',
        encryption: 'tls',
      }));
      toast.success('SendGrid preset applied (Port 587, TLS)');
    } else if (preset === 'ses') {
      setSmtpSettings((prev) => ({
        ...prev,
        host: 'email-smtp.ap-south-1.amazonaws.com',
        port: 587,
        encryption: 'tls',
      }));
      toast.success('Amazon SES Mumbai preset applied (Port 587, TLS)');
    }
  };

  const templateVariablesMap: Record<string, { key: string; label: string; desc: string }[]> = {
    order_confirmation: [
      { key: '{{order_id}}', label: 'Order ID', desc: 'Unique order identifier (e.g. MMU-8924)' },
      { key: '{{customer_name}}', label: 'Customer Name', desc: 'Full name of the purchaser' },
      { key: '{{total_amount}}', label: 'Total Amount', desc: 'Final invoice amount with 2 decimals (e.g. 1499.00)' },
      { key: '{{payment_method}}', label: 'Payment Mode', desc: 'Cash on Delivery or Online Payment (Razorpay)' },
      { key: '{{shipping_address}}', label: 'Shipping Address', desc: 'Customer delivery address with pin code' },
      { key: '{{items_summary}}', label: 'Items Summary', desc: 'Comma-separated line items summary' },
      { key: '{{date}}', label: 'Date & Time', desc: 'Current order timestamp' },
    ],
    payment_confirmation: [
      { key: '{{order_id}}', label: 'Order ID', desc: 'Associated order number' },
      { key: '{{payment_id}}', label: 'Payment ID', desc: 'Razorpay or gateway transaction ref' },
      { key: '{{customer_name}}', label: 'Customer Name', desc: 'Name of the payer' },
      { key: '{{total_amount}}', label: 'Total Amount', desc: 'Amount charged and received' },
      { key: '{{payment_method}}', label: 'Payment Mode', desc: 'Payment method utilized' },
      { key: '{{date}}', label: 'Payment Date', desc: 'Timestamp of confirmation' },
    ],
    otp_verification: [
      { key: '{{otp_code}}', label: 'OTP Code', desc: '6-digit numeric security code' },
      { key: '{{customer_name}}', label: 'Customer Name', desc: 'User account name if available' },
      { key: '{{date}}', label: 'Timestamp', desc: 'OTP generation timestamp' },
    ],
    welcome_customer: [
      { key: '{{customer_name}}', label: 'Customer Name', desc: 'Registered user full name' },
      { key: '{{date}}', label: 'Join Date', desc: 'Registration timestamp' },
    ],
  };

  const sampleVariables: Record<string, string> = {
    order_id: 'MMU-8924',
    customer_name: 'Pooja Sharma',
    total_amount: '1,499.00',
    payment_method: 'Online Payment (Razorpay / UPI)',
    shipping_address: '14, Green Valley Heights, Sojat City, Rajasthan 306104',
    items_summary: '2x Sojat Special Bridal Mehandi Cones (Box of 12), 1x Pure Herbal Henna Powder (1kg)',
    payment_id: 'pay_Nz9Kq12Vj',
    otp_code: '492817',
    date: new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const previewSubject = renderTemplate(currentTemplate?.subject || '', sampleVariables);
  const previewBody = renderTemplate(currentTemplate?.body || '', sampleVariables);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Platform & Business Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure enterprise info, Sojat heritage links, shipping charges, notification templates, and database links
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="self-start sm:self-auto p-2.5 text-gray-500 hover:text-henna-700 hover:bg-henna-50 rounded-xl border border-gray-200 transition-colors inline-flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap p-1 bg-white border border-gray-100 rounded-2xl shadow-sm gap-2">
        <button
          onClick={() => switchTab('business')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'business'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => switchTab('shipping')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'shipping'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Pricing</span>
        </button>

        <button
          onClick={() => switchTab('payment')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'payment'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateway</span>
        </button>

        <button
          onClick={() => switchTab('notifications')}
          className={`flex-1 min-w-[150px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications & SMTP</span>
        </button>

        <button
          onClick={() => switchTab('r2')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'r2'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Cloudflare R2</span>
        </button>

        <button
          onClick={() => switchTab('database')}
          className={`flex-1 min-w-[130px] py-3 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'database'
              ? 'bg-henna-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Stats</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500">Loading settings from Supabase...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Business Information */}
          {activeTab === 'business' && (
            <form onSubmit={handleSaveBusiness} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">
                    Business Profile & Location
                  </h2>
                  <p className="text-xs text-gray-500">Official corporate details displayed across the website</p>
                </div>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Business Name</label>
                  <input
                    type="text"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, name: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Tagline</label>
                  <input
                    type="text"
                    value={businessInfo.tagline}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, tagline: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Official Business Address</label>
                <input
                  type="text"
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo((p) => ({ ...p, address: e.target.value }))}
                  className="input"
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">Must reflect the registered Sojat City manufacturing facility</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="label">Official Phone</label>
                  <input
                    type="text"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, phone: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">WhatsApp Number</label>
                  <input
                    type="text"
                    value={businessInfo.whatsapp}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, whatsapp: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Official Email</label>
                  <input
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, email: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Google Business Profile & Map Embed
                </h3>
                <div>
                  <label className="label">Google Reviews / Business Profile URL</label>
                  <input
                    type="url"
                    value={businessInfo.google_reviews_url}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, google_reviews_url: e.target.value }))}
                    className="input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="label">Google Maps Embed URL</label>
                  <textarea
                    rows={2}
                    value={businessInfo.google_maps_url}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, google_maps_url: e.target.value }))}
                    className="input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">Facebook Page</label>
                  <input
                    type="url"
                    value={businessInfo.facebook}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, facebook: e.target.value }))}
                    placeholder="https://facebook.com/..."
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Instagram Profile</label>
                  <input
                    type="url"
                    value={businessInfo.instagram}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, instagram: e.target.value }))}
                    placeholder="https://instagram.com/..."
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Twitter / X</label>
                  <input
                    type="url"
                    value={businessInfo.twitter}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, twitter: e.target.value }))}
                    placeholder="https://twitter.com/..."
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">LinkedIn Page</label>
                  <input
                    type="url"
                    value={businessInfo.linkedin}
                    onChange={(e) => setBusinessInfo((p) => ({ ...p, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/..."
                    className="input text-xs"
                  />
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Shipping & Pricing */}
          {activeTab === 'shipping' && (
            <form onSubmit={handleSaveShipping} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">
                    Shipping & Commercial Parameters
                  </h2>
                  <p className="text-xs text-gray-500">Calculate delivery fees, thresholds, and checkout minimums</p>
                </div>
                <button type="submit" disabled={saving} className="btn-primary text-xs">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="label">Standard Shipping Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingSettings.base_shipping}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, base_shipping: Number(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Free Shipping Above (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingSettings.free_shipping_threshold}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, free_shipping_threshold: Number(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Applicable GST Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={shippingSettings.gst_rate}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, gst_rate: Number(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingSettings.min_order_amount}
                    onChange={(e) => setShippingSettings((p) => ({ ...p, min_order_amount: Number(e.target.value) }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Payment Modes Allowed at Checkout
                </h3>

                <div className="flex flex-col sm:flex-row gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shippingSettings.online_payment_enabled}
                      onChange={(e) => setShippingSettings((p) => ({ ...p, online_payment_enabled: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-henna-600 focus:ring-henna-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Online Payment (Cards, UPI, NetBanking)</span>
                      <span className="text-xs text-gray-500">Process prepaid transactions</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shippingSettings.cod_enabled}
                      onChange={(e) => setShippingSettings((p) => ({ ...p, cod_enabled: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-henna-600 focus:ring-henna-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Cash on Delivery (COD)</span>
                      <span className="text-xs text-gray-500">Allow customers to pay upon physical delivery in India</span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Payment Gateway */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">
                  Payment Processing Architecture
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Security policy: Payment gateway integration will be selected and tested before final live transactions
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Policy Notice per Project Specification (Section 8)
                </div>
                <p>
                  "Payment gateway integration to be selected before production. Do not claim payment processing is live until a payment provider is integrated and tested."
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Supported Gateway Providers for MMU
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <span className="font-bold text-gray-900 block text-sm">Razorpay</span>
                    <span className="text-xs text-gray-500 block mt-1">Recommended for domestic Indian retail (UPI, Rupay, NetBanking)</span>
                    <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">Ready for Keys</span>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <span className="font-bold text-gray-900 block text-sm">Stripe Worldwide</span>
                    <span className="text-xs text-gray-500 block mt-1">Optimal for international wholesale exports and foreign credit cards</span>
                    <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">Ready for Keys</span>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                    <span className="font-bold text-gray-900 block text-sm">Direct Bank Wire / TT</span>
                    <span className="text-xs text-gray-500 block mt-1">Preferred for commercial metric ton container export shipments</span>
                    <span className="inline-block mt-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-800">Active Mode</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Real-time Notifications & SMTP */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notifications Header & Subnav */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-henna-600" />
                    <span>Real-Time Notifications & SMTP Gateway</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure customer email templates, SMTP credentials, and inspect real-time dispatch logs in Supabase
                  </p>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('templates')}
                    className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      notifSubTab === 'templates'
                        ? 'bg-white text-henna-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Templates (4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('smtp')}
                    className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      notifSubTab === 'smtp'
                        ? 'bg-white text-henna-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>SMTP Server</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifSubTab('logs')}
                    className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                      notifSubTab === 'logs'
                        ? 'bg-white text-henna-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Live Audit Logs ({notificationLogs.length})</span>
                  </button>
                </div>
              </div>

              {/* SUB-SECTION 1: TEMPLATES */}
              {notifSubTab === 'templates' && (
                <div className="space-y-6">
                  {/* Template Picker Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      {
                        key: 'order_confirmation',
                        title: 'Order Placed',
                        desc: 'Dispatched to customer on checkout completion',
                        icon: ShoppingBag,
                      },
                      {
                        key: 'payment_confirmation',
                        title: 'Payment Receipt',
                        desc: 'Dispatched upon successful transaction capture',
                        icon: CreditCard,
                      },
                      {
                        key: 'otp_verification',
                        title: 'Security OTP',
                        desc: '6-digit OTP for Google / Email sign-in',
                        icon: ShieldCheck,
                      },
                      {
                        key: 'welcome_customer',
                        title: 'Welcome Customer',
                        desc: 'Greeting message for newly registered accounts',
                        icon: Sparkles,
                      },
                    ].map((tpl) => {
                      const isSelected = selectedTemplateKey === tpl.key;
                      const tData = notificationTemplates.find((t) => t.name === tpl.key);
                      return (
                        <button
                          key={tpl.key}
                          type="button"
                          onClick={() => setSelectedTemplateKey(tpl.key as any)}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-henna-50/50 border-henna-600 ring-2 ring-henna-600/20 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected ? 'bg-henna-600 text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              <tpl.icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                tData?.is_active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {tData?.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                          <div className="font-bold text-gray-900 text-sm">{tpl.title}</div>
                          <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">{tpl.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Editor & Live Preview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Editor Form (7 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                            <span>Edit Template: {currentTemplate?.title}</span>
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Last updated:{' '}
                            {currentTemplate?.updated_at
                              ? new Date(currentTemplate.updated_at).toLocaleString()
                              : 'Default'}
                          </p>
                        </div>

                        {/* Active toggle */}
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={currentTemplate?.is_active ?? true}
                            onChange={(e) => updateCurrentTemplate({ is_active: e.target.checked })}
                            className="w-4 h-4 rounded text-henna-600 focus:ring-henna-500 border-gray-300"
                          />
                          <span>Active</span>
                        </label>
                      </div>

                      {/* Subject Line */}
                      <div>
                        <label className="label flex items-center justify-between">
                          <span>Subject Line</span>
                          <span className="text-[11px] text-gray-400 font-normal">Supports dynamic tags</span>
                        </label>
                        <input
                          type="text"
                          value={currentTemplate?.subject || ''}
                          onChange={(e) => updateCurrentTemplate({ subject: e.target.value })}
                          placeholder="e.g. Order Confirmed: #{{order_id}}"
                          className="input font-medium"
                        />
                      </div>

                      {/* Available Dynamic Placeholders Chips */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Insert Dynamic Placeholders</span>
                          </label>
                          <span className="text-[10px] text-gray-400">Click to insert / copy</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          {(
                            templateVariablesMap[selectedTemplateKey] || [
                              { key: '{{order_id}}', label: 'Order ID' },
                              { key: '{{customer_name}}', label: 'Customer Name' },
                              { key: '{{total_amount}}', label: 'Total Amount' },
                            ]
                          ).map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => {
                                updateCurrentTemplate({
                                  body: (currentTemplate?.body || '') + ' ' + v.key,
                                });
                                navigator.clipboard?.writeText(v.key);
                                setCopiedVariable(v.key);
                                setTimeout(() => setCopiedVariable(null), 2000);
                                toast.success(`Inserted & copied ${v.key}`);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-henna-50 hover:text-henna-700 hover:border-henna-200 border border-gray-200 rounded-lg text-[11px] font-mono text-gray-700 transition flex items-center gap-1 shadow-2xs"
                              title={v.desc}
                            >
                              <span>{v.key}</span>
                              {copiedVariable === v.key ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Plus className="w-2.5 h-2.5 text-gray-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Body Message */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="label mb-0">Message Body (Email Text)</label>
                          <span className="text-[11px] text-gray-400">Plain text with auto line-breaks</span>
                        </div>
                        <textarea
                          rows={11}
                          value={currentTemplate?.body || ''}
                          onChange={(e) => updateCurrentTemplate({ body: e.target.value })}
                          placeholder="Write your email body message here..."
                          className="input font-mono text-xs leading-relaxed"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleSaveTemplates}
                          disabled={savingTemplates}
                          className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                        >
                          {savingTemplates ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>Save All Templates to Supabase</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const def = DEFAULT_TEMPLATES.find((t) => t.name === selectedTemplateKey);
                            if (def) {
                              updateCurrentTemplate({ subject: def.subject, body: def.body });
                              toast.success('Reset to default MMU template.');
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium underline"
                        >
                          Reset to Factory Template
                        </button>
                      </div>
                    </div>

                    {/* Right: Real-time Live Preview & Test Sender (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Live Customer Preview */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-henna-600" />
                            <span>Live Customer Preview</span>
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Rendered Sample
                          </span>
                        </div>

                        {/* Simulated Email Envelope */}
                        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 text-xs">
                          {/* Top metadata bar */}
                          <div className="bg-gray-100/90 px-3.5 py-2.5 border-b border-gray-200 space-y-1 text-[11px]">
                            <div className="flex items-center text-gray-600">
                              <span className="w-14 text-gray-400 font-medium">From:</span>
                              <span className="font-semibold text-gray-800 truncate">
                                {smtpSettings.from_name} &lt;{smtpSettings.from_email}&gt;
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="w-14 text-gray-400 font-medium">To:</span>
                              <span className="text-gray-700">Pooja Sharma &lt;customer@example.com&gt;</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="w-14 text-gray-400 font-medium">Subject:</span>
                              <span className="font-semibold text-henna-800 break-words">{previewSubject}</span>
                            </div>
                          </div>

                          {/* Email Body Content */}
                          <div className="p-4 bg-white space-y-3">
                            <div className="border-b border-henna-100 pb-2 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-henna-600 flex items-center justify-center text-white text-[10px] font-bold">
                                MMU
                              </div>
                              <span className="font-display font-bold text-xs text-henna-900">
                                Madan Mehandi Udhyog • Sojat City
                              </span>
                            </div>

                            <div className="whitespace-pre-wrap text-gray-700 text-xs leading-relaxed font-sans font-normal">
                              {previewBody}
                            </div>

                            <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 text-center">
                              © {new Date().getFullYear()} Madan Mehandi Udhyog. Authentic Triple-Sifted Sojat Henna.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Test Dispatch Form */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-henna-600" />
                            <span>Dispatch Test Notification</span>
                          </h4>
                          <span className="text-[10px] text-gray-400">Live test</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Test this template immediately. A record will be logged directly to Supabase.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={testRecipient}
                            onChange={(e) => setTestRecipient(e.target.value)}
                            placeholder="recipient@example.com"
                            className="input text-xs py-2"
                          />
                          <button
                            type="button"
                            onClick={handleSendTestNotification}
                            disabled={sendingTest}
                            className="btn-primary text-xs py-2 px-3.5 whitespace-nowrap inline-flex items-center gap-1.5"
                          >
                            {sendingTest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Send Test</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 2: SMTP SETTINGS */}
              {notifSubTab === 'smtp' && (
                <form onSubmit={handleSaveSmtp} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Server className="w-5 h-5 text-henna-600" />
                        <span>SMTP Email Gateway Configuration</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Connect your company mail server (Gmail Workspace, Office 365, SendGrid, or SES) to send real-time order and payment receipts
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestSmtpConnection}
                        disabled={testingSmtp}
                        className="btn-secondary text-xs px-4 py-2.5 inline-flex items-center gap-2 border-henna-300 text-henna-700 hover:bg-henna-50"
                      >
                        {testingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                        <span>Test Connection</span>
                      </button>

                      <button
                        type="submit"
                        disabled={savingSmtp}
                        className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                      >
                        {savingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>Save SMTP Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Diagnostic Panel */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Live SMTP Connection Tester & Ping</span>
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Verify server credentials and deliver an actual test email to the recipient below
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={smtpTestRecipient}
                          onChange={(e) => setSmtpTestRecipient(e.target.value)}
                          placeholder="Recipient email address..."
                          className="input text-xs py-1.5 w-60 bg-white"
                        />
                        <button
                          type="button"
                          onClick={handleTestSmtpConnection}
                          disabled={testingSmtp}
                          className="btn-primary text-xs py-1.5 px-3.5 whitespace-nowrap inline-flex items-center gap-1.5"
                        >
                          {testingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>Send Test Email</span>
                        </button>
                      </div>
                    </div>

                    {/* Result alert if test performed */}
                    {smtpTestResult && (
                      <div
                        className={`p-3.5 rounded-lg text-xs space-y-1 border ${
                          smtpTestResult.success
                            ? 'bg-green-50 border-green-200 text-green-900'
                            : 'bg-red-50 border-red-200 text-red-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {smtpTestResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span>
                            {smtpTestResult.success
                              ? 'SMTP Connection Verified & Live Test Mail Dispatched!'
                              : 'SMTP Server Connection Failed'}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] leading-relaxed break-words pl-6">
                          {smtpTestResult.error || smtpTestResult.message}
                        </p>
                        {smtpTestResult.hint && (
                          <div className="ml-6 mt-1.5 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                            <strong>Setup Guidance:</strong> {smtpTestResult.hint}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 1-Click Quick Presets */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                      1-Click SMTP Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applySmtpPreset('gmail')}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-henna-50 hover:text-henna-700 hover:border-henna-300 text-xs font-semibold transition"
                      >
                        ✉️ Google Workspace / Gmail
                      </button>
                      <button
                        type="button"
                        onClick={() => applySmtpPreset('outlook')}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-henna-50 hover:text-henna-700 hover:border-henna-300 text-xs font-semibold transition"
                      >
                        📧 Microsoft Outlook 365
                      </button>
                      <button
                        type="button"
                        onClick={() => applySmtpPreset('sendgrid')}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-henna-50 hover:text-henna-700 hover:border-henna-300 text-xs font-semibold transition"
                      >
                        🚀 Twilio SendGrid
                      </button>
                      <button
                        type="button"
                        onClick={() => applySmtpPreset('ses')}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-henna-50 hover:text-henna-700 hover:border-henna-300 text-xs font-semibold transition"
                      >
                        ☁️ Amazon SES (Mumbai)
                      </button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="label">SMTP Host / Server</label>
                      <input
                        type="text"
                        value={smtpSettings.host}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, host: e.target.value.trim() }))}
                        placeholder="smtp.gmail.com"
                        className="input font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Port</label>
                      <input
                        type="number"
                        value={smtpSettings.port}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, port: Number(e.target.value) }))}
                        placeholder="587"
                        className="input font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Encryption Protocol</label>
                      <select
                        value={smtpSettings.encryption}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, encryption: e.target.value as any }))}
                        className="input text-xs"
                      >
                        <option value="tls">STARTTLS / TLS (Port 587 - Recommended)</option>
                        <option value="ssl">SSL (Port 465)</option>
                        <option value="none">None / Plain (Port 25)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label">SMTP Username / Account Email</label>
                      <input
                        type="text"
                        value={smtpSettings.username}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, username: e.target.value.trim() }))}
                        placeholder="orders@madanmehandi.com"
                        className="input font-mono text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">SMTP Password / App Password</label>
                      <div className="relative">
                        <input
                          type={showSmtpSecret ? 'text' : 'password'}
                          value={smtpSettings.password || ''}
                          onChange={(e) => setSmtpSettings((p) => ({ ...p, password: e.target.value }))}
                          placeholder="••••••••••••••••"
                          className="input font-mono text-xs pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSmtpSecret(!showSmtpSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showSmtpSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label">From / Reply-To Email</label>
                      <input
                        type="email"
                        value={smtpSettings.from_email}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, from_email: e.target.value.trim() }))}
                        placeholder="orders@madanmehandi.com"
                        className="input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Sender Display Name</label>
                      <input
                        type="text"
                        value={smtpSettings.from_name}
                        onChange={(e) => setSmtpSettings((p) => ({ ...p, from_name: e.target.value }))}
                        placeholder="Madan Mehandi Udhyog"
                        className="input text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Automation triggers */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Automated Customer Notification Triggers
                    </h4>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpSettings.auto_send_order}
                          onChange={(e) => setSmtpSettings((p) => ({ ...p, auto_send_order: e.target.checked }))}
                          className="w-4 h-4 rounded text-henna-600 focus:ring-henna-500 border-gray-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            Auto-Dispatch Order Confirmation Email
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Triggered immediately when customer completes checkout in Checkout.tsx
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpSettings.auto_send_payment}
                          onChange={(e) => setSmtpSettings((p) => ({ ...p, auto_send_payment: e.target.checked }))}
                          className="w-4 h-4 rounded text-henna-600 focus:ring-henna-500 border-gray-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            Auto-Dispatch Payment Received Confirmation Receipt
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Triggered when payment is confirmed for prepaid Razorpay or online transactions
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smtpSettings.is_enabled}
                          onChange={(e) => setSmtpSettings((p) => ({ ...p, is_enabled: e.target.checked }))}
                          className="w-4 h-4 rounded text-henna-600 focus:ring-henna-500 border-gray-300"
                        />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            Enable Real-Time Notification Dispatch Engine
                          </span>
                          <span className="text-[11px] text-gray-500">
                            Master switch for all customer notification dispatches
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </form>
              )}

              {/* SUB-SECTION 3: REAL-TIME AUDIT LOGS */}
              {notifSubTab === 'logs' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-henna-600" />
                        <span>Live Dispatched Notifications History</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Real-time audit log of all order, payment, and OTP verification messages sent to customers
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const logs = await getNotificationLogs();
                          setNotificationLogs(logs);
                          toast.success('Logs refreshed from Supabase!');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-henna-700 hover:bg-henna-50 transition inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                      </button>

                      {notificationLogs.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearLogs}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Logs</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 font-medium">Filter:</span>
                    {(['all', 'order_confirmation', 'payment_confirmation', 'otp_verification'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setLogFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          logFilter === f
                            ? 'bg-henna-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f === 'all'
                          ? `All (${notificationLogs.length})`
                          : f === 'order_confirmation'
                          ? 'Orders'
                          : f === 'payment_confirmation'
                          ? 'Payments'
                          : 'OTP Codes'}
                      </button>
                    ))}
                  </div>

                  {/* Logs Table */}
                  {notificationLogs.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-xs space-y-2">
                      <Mail className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="font-semibold text-gray-600">No notifications logged yet</p>
                      <p>
                        Place an order in checkout, sign in with OTP, or dispatch a test message from the Templates tab to see live records here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-3">Timestamp</th>
                            <th className="py-3 px-3">Recipient</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3">Subject</th>
                            <th className="py-3 px-3">Status</th>
                            <th className="py-3 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {notificationLogs
                            .filter((log) => logFilter === 'all' || log.template_name === logFilter)
                            .map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50/70 transition">
                                <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-gray-900">{log.recipient_email}</div>
                                  {log.recipient_phone && (
                                    <div className="text-[10px] text-gray-400">{log.recipient_phone}</div>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      log.template_name === 'order_confirmation'
                                        ? 'bg-blue-100 text-blue-700'
                                        : log.template_name === 'payment_confirmation'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : log.template_name === 'otp_verification'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}
                                  >
                                    {log.template_title || log.template_name}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-700 max-w-xs truncate" title={log.subject}>
                                  {log.subject}
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                    <span>Sent (Supabase Logged)</span>
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLogDetail(log)}
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 hover:bg-henna-50 hover:text-henna-700 text-gray-700 transition"
                                  >
                                    View Message
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Cloudflare R2 Bucket Storage */}
          {activeTab === 'r2' && (
            <form onSubmit={handleSaveR2} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-henna-600" />
                    Cloudflare R2 Object Storage
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Store high-resolution product photos, packaging artwork, and manufacturing videos without database bloat.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save R2 Config</span>
                </button>
              </div>

              {/* Status Alert */}
              <div className="p-4 rounded-xl bg-henna-50/70 border border-henna-100 text-xs text-henna-900 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-henna-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Zero Database Binary Overhead:</span>
                  <span>
                    Binaries are kept in your Cloudflare R2 bucket while only delivery URLs and object keys are indexed in Supabase rows.
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Cloudflare Account ID</label>
                  <input
                    type="text"
                    value={r2Settings.accountId}
                    onChange={(e) =>
                      setR2Settings((prev) => ({ ...prev, accountId: e.target.value.trim() }))
                    }
                    placeholder="e.g. 8f921ab07e990c88bc34d82..."
                    className="input font-mono text-xs"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Found on your Cloudflare Dashboard right sidebar.
                  </span>
                </div>

                <div>
                  <label className="label">R2 Bucket Name</label>
                  <input
                    type="text"
                    value={r2Settings.bucketName}
                    onChange={(e) =>
                      setR2Settings((prev) => ({ ...prev, bucketName: e.target.value.trim() }))
                    }
                    placeholder="e.g. mmu-media or mmu-products"
                    className="input font-mono text-xs"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    The name of your Cloudflare R2 bucket.
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="label">Public Delivery / CDN URL</label>
                  <input
                    type="url"
                    value={r2Settings.publicUrl}
                    onChange={(e) =>
                      setR2Settings((prev) => ({ ...prev, publicUrl: e.target.value.trim() }))
                    }
                    placeholder="e.g. https://pub-xxxxxx.r2.dev or https://media.madanmehandi.com"
                    className="input font-mono text-xs"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Public R2.dev domain or custom CNAME mapped to your R2 bucket.
                  </span>
                </div>

                <div>
                  <label className="label">R2 Access Key ID (API Token)</label>
                  <input
                    type="text"
                    value={r2Settings.accessKeyId || ''}
                    onChange={(e) =>
                      setR2Settings((prev) => ({ ...prev, accessKeyId: e.target.value.trim() }))
                    }
                    placeholder="e.g. 748b9910c2e..."
                    className="input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="label">R2 Secret Access Key</label>
                  <div className="relative">
                    <input
                      type={showR2Secret ? 'text' : 'password'}
                      value={r2Settings.secretAccessKey || ''}
                      onChange={(e) =>
                        setR2Settings((prev) => ({ ...prev, secretAccessKey: e.target.value.trim() }))
                      }
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="input font-mono text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowR2Secret(!showR2Secret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showR2Secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bucket Storage Mode Indicator */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">Current Active Storage Provider:</span>
                  <span className="text-gray-500">
                    {r2Settings.publicUrl && r2Settings.accountId
                      ? 'Cloudflare R2 Direct Bucket Mode'
                      : 'Supabase Storage Bucket Fallback (mmu-media active)'}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[11px] font-bold">
                  Active
                </span>
              </div>
            </form>
          )}

          {/* TAB 5: Database & Infrastructure */}
          {activeTab === 'database' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-gray-900">
                  Live Supabase PostgreSQL Connection
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Real-time database statistics directly from Supabase
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Products in DB</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.productsCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Orders Stored</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.ordersCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Customer Enquiries</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.enquiriesCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Manufacturing Leads</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.manufacturingCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Customer Reviews</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.reviewsCount}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-400 block font-medium">Registered Accounts</span>
                  <span className="font-display text-2xl font-bold text-henna-800 mt-1 block">
                    {dbStats.customersCount}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Supabase Connected & Operational</span>
                </div>
                <span className="font-mono text-[11px] text-green-700">evbuchyepfjaxkeekxdm.supabase.co</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: View Dispatched Email Content */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Dispatched Notification Details</h3>
                <p className="text-xs text-gray-400">
                  {new Date(selectedLogDetail.created_at).toLocaleString()} • ID: {selectedLogDetail.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs">
              <div>
                <span className="font-semibold text-gray-500">Recipient:</span>{' '}
                <span className="font-mono text-gray-900 font-bold">{selectedLogDetail.recipient_email}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Template:</span>{' '}
                <span className="text-gray-900">{selectedLogDetail.template_title}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Subject:</span>{' '}
                <span className="font-bold text-henna-800">{selectedLogDetail.subject}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Delivered Message Body:</label>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedLogDetail.body}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
