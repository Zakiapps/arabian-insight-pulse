
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan_id, billing_period = 'monthly' } = await req.json();

    if (!plan_id) {
      return new Response(
        JSON.stringify({ error: 'Plan ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // For free plans, just return success
    if (plan.price_monthly === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Free plan activated',
          plan: plan.name 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Mock Stripe checkout session for now
    // In production, you would integrate with actual Stripe API
    const mockCheckoutSession = {
      id: 'cs_mock_' + Math.random().toString(36).substr(2, 9),
      url: `https://checkout.stripe.com/pay/mock_session_${plan_id}`,
      payment_status: 'unpaid',
      amount_total: billing_period === 'yearly' ? plan.price_yearly : plan.price_monthly,
      currency: 'jod',
      customer_email: null,
      metadata: {
        plan_id: plan_id,
        billing_period: billing_period
      }
    };

    // Log the checkout session creation
    console.log(`Created checkout session for plan: ${plan.name}, billing: ${billing_period}`);

    return new Response(
      JSON.stringify({
        id: mockCheckoutSession.id,
        url: mockCheckoutSession.url,
        plan_name: plan.name,
        amount: mockCheckoutSession.amount_total,
        billing_period
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
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
