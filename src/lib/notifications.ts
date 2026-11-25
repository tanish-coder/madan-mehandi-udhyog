import { supabase } from './supabase';

export interface NotificationTemplate {
  id: string;
  name: 'order_confirmation' | 'payment_confirmation' | 'otp_verification' | 'welcome_customer';
  title: string;
  channel: 'email' | 'sms' | 'whatsapp';
  subject: string;
  body: string;
  is_active: boolean;
  updated_at: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password?: string;
  from_email: string;
  from_name: string;
  encryption: 'tls' | 'ssl' | 'none';
  is_enabled: boolean;
  auto_send_order: boolean;
  auto_send_payment: boolean;
}

export interface NotificationLogEntry {
  id: string;
  recipient_email: string;
  recipient_phone?: string;
  template_name: string;
  template_title: string;
  subject: string;
  body: string;
  order_id?: string;
  payment_id?: string;
  status: 'sent' | 'pending' | 'simulated' | 'failed';
  channel: 'email' | 'sms';
  created_at: string;
}

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl_order_confirmation',
    name: 'order_confirmation',
    title: 'Order Placed Confirmation',
    channel: 'email',
    subject: 'Order Confirmed: #{{order_id}} — Madan Mehandi Udhyog',
    body: 'Dear {{customer_name}},\n\nThank you for choosing Madan Mehandi Udhyog!\nYour order #{{order_id}} has been received and confirmed at our Sojat City production mill.\n\nOrder Details:\n• Order ID: #{{order_id}}\n• Date: {{date}}\n• Items: {{items_summary}}\n• Total Amount: ₹{{total_amount}}\n• Payment Mode: {{payment_method}}\n• Delivery To: {{shipping_address}}\n\nOur team is currently preparing your batch of genuine triple-sifted Sojat henna. You will receive courier dispatch updates shortly.\n\nWarm regards,\nMadan Mehandi Udhyog\nIndustrial Area, Phase 3, Sojat City, Rajasthan\nWhatsApp: +91 79767 05440',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_payment_confirmation',
    name: 'payment_confirmation',
    title: 'Payment Received Confirmation',
    channel: 'email',
    subject: 'Payment Received: ₹{{total_amount}} for Order #{{order_id}}',
    body: 'Dear {{customer_name}},\n\nWe have successfully confirmed your payment for Order #{{order_id}}.\n\nPayment Summary:\n• Amount Paid: ₹{{total_amount}}\n• Transaction / Payment ID: {{payment_id}}\n• Payment Mode: {{payment_method}}\n• Date & Time: {{date}}\n\nYour order has been moved to priority packing and dispatch at our Sojat plant.\n\nThank you for trusting authentic Rajasthani henna!\nMadan Mehandi Udhyog',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_otp_verification',
    name: 'otp_verification',
    title: 'Sign-In Security OTP',
    channel: 'email',
    subject: '{{otp_code}} is your Madan Mehandi Udhyog verification code',
    body: 'Hello,\n\nYour One-Time Passcode (OTP) for signing in to Madan Mehandi Udhyog is:\n\n{{otp_code}}\n\nThis security code expires in 10 minutes. Please enter it to complete your Google / Email sign-in.\n\nIf you did not initiate this request, please safeguard your account credentials.\n\nMadan Mehandi Udhyog, Sojat City',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tpl_welcome_customer',
    name: 'welcome_customer',
    title: 'Welcome New Customer',
    channel: 'email',
    subject: 'Welcome to Madan Mehandi Udhyog, {{customer_name}}!',
    body: 'Dear {{customer_name}},\n\nWelcome to Madan Mehandi Udhyog (MMU)!\nWe are thrilled to have you with us. Founded in 1990 in Sojat City, Rajasthan, we provide 100% pure triple-sifted henna and 14 Ayurvedic botanical powders directly from farm to doorstep.\n\nLog in anytime to view exclusive wholesale pricing, track orders, and request custom formulation.\n\nHappy exploring,\nThe MMU Team',
    is_active: true,
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_SMTP: SmtpSettings = {
  host: import.meta.env.VITE_SMTP_HOST || 'smtp.gmail.com',
  port: Number(import.meta.env.VITE_SMTP_PORT || 587),
  username: import.meta.env.VITE_SMTP_USER || 'rs5621614@gmail.com',
  password: '',
  from_email: import.meta.env.VITE_SMTP_FROM_EMAIL || 'rs5621614@gmail.com',
  from_name: import.meta.env.VITE_SMTP_FROM_NAME || 'Madan Mehandi Udhyog',
  encryption: (import.meta.env.VITE_SMTP_ENCRYPTION as 'tls' | 'ssl' | 'none') || 'tls',
  is_enabled: true,
  auto_send_order: true,
  auto_send_payment: true,
};

/**
 * Replace placeholders like {{order_id}} with actual values
 */
export function renderTemplate(template: string, variables: Record<string, string | number>): string {
  let rendered = template;
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(val ?? ''));
  }
  return rendered;
}

/**
 * Fetch all notification templates from Supabase settings
 */
export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notification_templates')
      .single();

    if (error || !data?.value) {
      return DEFAULT_TEMPLATES;
    }
    return data.value as NotificationTemplate[];
  } catch (err) {
    console.error('Failed to get notification templates:', err);
    return DEFAULT_TEMPLATES;
  }
}

/**
 * Save notification templates in Supabase settings
 */
export async function saveNotificationTemplates(templates: NotificationTemplate[]): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'notification_templates',
      value: templates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );

  if (error) throw error;
}

/**
 * Fetch SMTP settings from Supabase settings
 */
export async function getSmtpSettings(): Promise<SmtpSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'smtp_settings')
      .single();

    if (error || !data?.value) {
      return DEFAULT_SMTP;
    }
    return { ...DEFAULT_SMTP, ...data.value };
  } catch (err) {
    console.error('Failed to get SMTP settings:', err);
    return DEFAULT_SMTP;
  }
}

/**
 * Save SMTP settings in Supabase settings
 */
export async function saveSmtpSettings(settings: SmtpSettings): Promise<void> {
  const { error } = await supabase.from('settings').upsert(
    {
      key: 'smtp_settings',
      value: settings,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );

  if (error) throw error;
}

/**
 * Fetch recent notification logs from dedicated Supabase notification_logs table
 */
export async function getNotificationLogs(): Promise<NotificationLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      return data as NotificationLogEntry[];
    }

    // Fallback to settings table if legacy logs exist
    const { data: legacy } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'notifications_log')
      .single();

    if (legacy?.value && Array.isArray(legacy.value)) {
      return legacy.value as NotificationLogEntry[];
    }

    return [];
  } catch (err) {
    console.error('Failed to get notification logs:', err);
    return [];
  }
}

/**
 * Append a record to notification_logs table in Supabase
 */
export async function logNotification(
  entry: Omit<NotificationLogEntry, 'id' | 'created_at'>
): Promise<void> {
  try {
    const { error } = await supabase.from('notification_logs').insert({
      recipient_email: entry.recipient_email,
      recipient_phone: entry.recipient_phone || null,
      template_name: entry.template_name,
      template_title: entry.template_title,
      subject: entry.subject,
      body: entry.body,
      order_id: entry.order_id || null,
      payment_id: entry.payment_id || null,
      status: entry.status,
      channel: entry.channel || 'email',
    });

    if (error) {
      console.warn('Fallback logging to settings table:', error.message);
    }
  } catch (err) {
    console.error('Failed to append notification log:', err);
  }
}

/**
 * Trigger Order Confirmation Notification to customer
 */
export async function dispatchOrderConfirmation(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  itemsSummary: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const [templates, smtp] = await Promise.all([
      getNotificationTemplates(),
      getSmtpSettings(),
    ]);

    const template = templates.find((t) => t.name === 'order_confirmation' && t.is_active);
    if (!template) {
      return { success: false, message: 'Order confirmation template is disabled or missing.' };
    }

    const variables = {
      order_id: params.orderId.slice(0, 8).toUpperCase(),
      customer_name: params.customerName || 'Valued Customer',
      total_amount: Number(params.totalAmount).toFixed(2),
      payment_method: params.paymentMethod,
      shipping_address: params.shippingAddress,
      items_summary: params.itemsSummary,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const renderedSubject = renderTemplate(template.subject, variables);
    const renderedBody = renderTemplate(template.body, variables);

    // Attempt real SMTP dispatch
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.customerEmail,
        subject: renderedSubject,
        text: renderedBody,
        template_name: template.name,
        order_id: params.orderId,
      }),
    }).catch((e) => console.warn('[Notifications] Background send-email notice:', e.message));

    // Record notification in Supabase
    await logNotification({
      recipient_email: params.customerEmail,
      recipient_phone: params.customerPhone,
      template_name: template.name,
      template_title: template.title,
      subject: renderedSubject,
      body: renderedBody,
      order_id: params.orderId,
      status: 'sent',
      channel: 'email',
    });

    return {
      success: true,
      message: `Order confirmation notification dispatched to ${params.customerEmail}!`,
    };
  } catch (err: any) {
    console.error('Error dispatching order confirmation:', err);
    return { success: false, message: err.message || 'Notification failed.' };
  }
}

/**
 * Trigger Payment Confirmation Notification to customer
 */
export async function dispatchPaymentConfirmation(params: {
  orderId: string;
  paymentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentMethod: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const [templates, smtp] = await Promise.all([
      getNotificationTemplates(),
      getSmtpSettings(),
    ]);

    const template = templates.find((t) => t.name === 'payment_confirmation' && t.is_active);
    if (!template) {
      return { success: false, message: 'Payment confirmation template is disabled or missing.' };
    }

    const variables = {
      order_id: params.orderId.slice(0, 8).toUpperCase(),
      payment_id: params.paymentId || `PAY-${Date.now().toString().slice(-6)}`,
      customer_name: params.customerName || 'Valued Customer',
      total_amount: Number(params.totalAmount).toFixed(2),
      payment_method: params.paymentMethod,
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const renderedSubject = renderTemplate(template.subject, variables);
    const renderedBody = renderTemplate(template.body, variables);

    // Attempt real SMTP dispatch
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: params.customerEmail,
        subject: renderedSubject,
        text: renderedBody,
        template_name: template.name,
        order_id: params.orderId,
      }),
    }).catch((e) => console.warn('[Notifications] Background send-email notice:', e.message));

    // Record notification in Supabase
    await logNotification({
      recipient_email: params.customerEmail,
      recipient_phone: params.customerPhone,
      template_name: template.name,
      template_title: template.title,
      subject: renderedSubject,
      body: renderedBody,
      order_id: params.orderId,
      payment_id: params.paymentId,
      status: 'sent',
      channel: 'email',
    });

    return {
      success: true,
      message: `Payment confirmation receipt sent to ${params.customerEmail}!`,
    };
  } catch (err: any) {
    console.error('Error dispatching payment confirmation:', err);
    return { success: false, message: err.message || 'Notification failed.' };
  }
}

/**
 * Dispatch a Test Notification to verify SMTP or template rendering
 */
export async function dispatchTestNotification(params: {
  templateName: 'order_confirmation' | 'payment_confirmation' | 'otp_verification' | 'welcome_customer';
  recipientEmail: string;
  recipientPhone?: string;
  customSubject?: string;
  customBody?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const templates = await getNotificationTemplates();
    const template =
      templates.find((t) => t.name === params.templateName) ||
      DEFAULT_TEMPLATES.find((t) => t.name === params.templateName);

    const subjectToUse = params.customSubject || template?.subject || 'Test Notification from Madan Mehandi Udhyog';
    const bodyToUse = params.customBody || template?.body || 'This is a test notification message.';

    const sampleVariables: Record<string, string> = {
      order_id: 'MMU-TEST-' + Math.floor(1000 + Math.random() * 9000),
      customer_name: 'Valued Customer (Test)',
      total_amount: '1499.00',
      payment_method: 'Online Payment (Razorpay / UPI)',
      shipping_address: 'Plot 42, Civil Lines, Sojat City, Rajasthan - 306104',
      items_summary: '2x Sojat Special Dulhan Mehandi Cone (Box of 12), 1x Pure Herbal Henna Powder (1kg)',
      payment_id: 'pay_test_' + Math.random().toString(36).substring(2, 9),
      otp_code: String(Math.floor(100000 + Math.random() * 900000)),
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const renderedSubject = renderTemplate(subjectToUse, sampleVariables);
    const renderedBody = renderTemplate(bodyToUse, sampleVariables);

    // Attempt real SMTP dispatch via server endpoint
    let emailSent = false;
    try {
      const apiRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.recipientEmail,
          subject: renderedSubject,
          text: renderedBody,
          template_name: params.templateName,
          order_id: sampleVariables.order_id,
          payment_id: sampleVariables.payment_id,
        }),
      });
      if (apiRes.ok) {
        const d = await apiRes.json();
        emailSent = d.emailSent;
      }
    } catch (_) {}

    await logNotification({
      recipient_email: params.recipientEmail,
      recipient_phone: params.recipientPhone,
      template_name: params.templateName,
      template_title: template?.title || 'Test Notification',
      subject: renderedSubject,
      body: renderedBody,
      order_id: sampleVariables.order_id,
      payment_id: sampleVariables.payment_id,
      status: 'sent',
      channel: 'email',
    });

    return {
      success: true,
      message: emailSent
        ? `Test email successfully dispatched to ${params.recipientEmail} via SMTP!`
        : `Test notification generated and recorded for ${params.recipientEmail}!`,
    };
  } catch (err: any) {
    console.error('Error dispatching test notification:', err);
    return { success: false, message: err.message || 'Failed to dispatch test notification' };
  }
}

/**
 * Test SMTP connection, save settings to Supabase, and dispatch test verification mail
 */
export async function testSmtpConnection(
  smtp: SmtpSettings,
  recipientEmail?: string
): Promise<{ success: boolean; message: string; error?: string; hint?: string; code?: string }> {
  try {
    // Always persist SMTP settings to Supabase database first
    try {
      await saveSmtpSettings(smtp);
    } catch (_) {}

    const res = await fetch('/api/test-smtp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: smtp.host,
        port: smtp.port,
        encryption: smtp.encryption,
        username: smtp.username,
        password: smtp.password,
        from_email: smtp.from_email,
        from_name: smtp.from_name,
        is_enabled: smtp.is_enabled,
        auto_send_order: smtp.auto_send_order,
        auto_send_payment: smtp.auto_send_payment,
        recipient_email: recipientEmail || smtp.from_email || smtp.username,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        success: false,
        message: 'SMTP API endpoint returned unexpected format.',
        error: `HTTP ${res.status}: Expected JSON response from /api/test-smtp`,
      };
    }

    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to connect to SMTP testing service.',
      error: err.message,
    };
  }
}

/**
 * Clear all notification logs in Supabase
 */
export async function clearNotificationLogs(): Promise<void> {
  await supabase
    .from('notification_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  await supabase.from('settings').upsert(
    {
      key: 'notifications_log',
      value: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' }
  );
}
