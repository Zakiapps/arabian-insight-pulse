
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendGridSettings {
  api_key: string;
  from_email: string;
  from_name: string;
  enabled: boolean;
}

interface NotificationRequest {
  user_id: string;
  alert_id: string;
  message: string;
  subject: string;
  recipient_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, alert_id, message, subject, recipient_email }: NotificationRequest = await req.json();

    // Get SendGrid settings for the user
    const { data: settings, error: settingsError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/sendgrid_settings?user_id=eq.${user_id}&select=*`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
      }
    ).then(res => res.json());

    if (settingsError || !settings || settings.length === 0) {
      throw new Error('SendGrid settings not found for user');
    }

    const sendGridSettings: SendGridSettings = settings[0];

    if (!sendGridSettings.enabled || !sendGridSettings.api_key) {
      throw new Error('SendGrid is not enabled or API key is missing');
    }

    // Send email via SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridSettings.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipient_email }],
            subject: subject,
          },
        ],
        from: {
          email: sendGridSettings.from_email,
          name: sendGridSettings.from_name,
        },
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">تنبيه من نظام تحليل المشاعر</h1>
                </div>
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                  <h2 style="color: #343a40; margin-top: 0;">تنبيه جديد</h2>
                  <div style="background: white; padding: 20px; border-radius: 8px; border-right: 4px solid #007bff; margin: 20px 0;">
                    <p style="margin: 0; line-height: 1.6; color: #495057;">${message}</p>
                  </div>
                  <hr style="border: none; border-top: 1px solid #dee2e6; margin: 20px 0;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0;">
                    تم إرسال هذا التنبيه تلقائياً من نظام تحليل المشاعر. لا تقم بالرد على هذا البريد الإلكتروني.
                  </p>
                </div>
              </div>
            `,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`SendGrid API error: ${errorData}`);
    }

    // Log notification in database
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/notification_history`,
      {
        method: 'POST',
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id,
          alert_id,
          type: 'email',
          status: 'sent',
          message,
        }),
      }
    );

    return new Response(JSON.stringify({ success: true, message: 'Notification sent successfully' }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error sending notification:", error);
    
    // Log failed notification
    const { user_id, alert_id, message } = await req.json().catch(() => ({}));
    if (user_id) {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/notification_history`,
        {
          method: 'POST',
          headers: {
            'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id,
            alert_id,
            type: 'email',
            status: 'failed',
            message: message || 'Failed to send notification',
          }),
        }
      ).catch(() => {});
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
