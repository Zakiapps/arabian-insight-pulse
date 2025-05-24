
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Send email using SendGrid (you'll need to add SENDGRID_API_KEY to secrets)
async function sendEmail(to: string, subject: string, html: string) {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  
  if (!sendGridApiKey) {
    console.error('Missing SendGrid API key');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: {
          email: 'alerts@jordaninsights.com',
          name: 'Jordan Insights'
        },
        content: [{
          type: 'text/html',
          value: html
        }]
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Generate email content for daily/weekly digest
function generateDigestEmail(posts: any[], category: string, frequency: string) {
  const categoryNames: Record<string, string> = {
    'economics': 'الاقتصاد',
    'politics': 'السياسة', 
    'sports': 'الرياضة',
    'education': 'التعليم',
    'other': 'أخرى'
  };

  const subject = `ملخص ${frequency === 'daily' ? 'يومي' : 'أسبوعي'} - ${categoryNames[category] || category}`;
  
  let html = `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <h2 style="color: #2563eb;">تحليل المشاعر - ${categoryNames[category] || category}</h2>
      <p>إليك ملخص آخر المنشورات في فئة ${categoryNames[category] || category}:</p>
  `;

  posts.forEach(post => {
    const sentimentEmoji = post.sentiment === 'positive' ? '😊' : 
                          post.sentiment === 'negative' ? '😞' : '😐';
    
    html += `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <h4 style="margin: 0; color: #374151;">${post.platform === 'twitter' ? 'تويتر' : 'فيسبوك'}</h4>
        <p style="margin: 8px 0;">${post.content}</p>
        <div style="font-size: 14px; color: #6b7280;">
          <span>المشاعر: ${sentimentEmoji} ${post.sentiment}</span>
          <span style="margin-right: 16px;">التفاعل: ${post.engagement_count}</span>
          ${post.is_viral ? '<span style="color: #dc2626; margin-right: 16px;">🔥 منشور رائج</span>' : ''}
        </div>
      </div>
    `;
  });

  html += `
      <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
        تم إنشاء هذا التقرير تلقائياً بواسطة نظام تحليل المشاعر
      </p>
    </div>
  `;

  return { subject, html };
}

// Check for trending topics and send urgent alerts
async function checkTrendingTopics() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: viralPosts } = await supabase
    .from('social_media_posts')
    .select('*')
    .eq('is_viral', true)
    .gte('created_at', oneDayAgo)
    .order('engagement_count', { ascending: false })
    .limit(5);

  if (viralPosts && viralPosts.length > 0) {
    // Get users subscribed to urgent alerts
    const { data: urgentSubscriptions } = await supabase
      .from('alert_subscriptions')
      .select('*')
      .eq('frequency', 'urgent')
      .eq('is_active', true);

    for (const subscription of urgentSubscriptions || []) {
      const filteredPosts = viralPosts.filter(post => 
        subscription.category === 'all' || post.category === subscription.category
      );

      if (filteredPosts.length > 0) {
        const { subject, html } = generateDigestEmail(filteredPosts, 'trending', 'urgent');
        await sendEmail(subscription.email, `🔥 تنبيه عاجل: ${subject}`, html);
      }
    }
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    let alertsSent = 0;

    if (type === 'daily' || type === 'weekly') {
      const timeRange = type === 'daily' ? 1 : 7;
      const timeAgo = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString();

      // Get active subscriptions for this frequency
      const { data: subscriptions } = await supabase
        .from('alert_subscriptions')
        .select('*')
        .eq('frequency', type)
        .eq('is_active', true);

      for (const subscription of subscriptions || []) {
        // Get posts for this category and time range
        const { data: posts } = await supabase
          .from('social_media_posts')
          .select('*')
          .eq('category', subscription.category)
          .gte('created_at', timeAgo)
          .order('engagement_count', { ascending: false })
          .limit(10);

        if (posts && posts.length > 0) {
          const { subject, html } = generateDigestEmail(posts, subscription.category, type);
          const emailSent = await sendEmail(subscription.email, subject, html);
          
          if (emailSent) {
            alertsSent++;
            // Update last sent timestamp
            await supabase
              .from('alert_subscriptions')
              .update({ last_sent_at: new Date().toISOString() })
              .eq('id', subscription.id);
          }
        }
      }
    } else if (type === 'urgent') {
      await checkTrendingTopics();
      alertsSent = 1; // Simplified for trending check
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${alertsSent} alerts`,
        alerts_sent: alertsSent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in send-alerts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
