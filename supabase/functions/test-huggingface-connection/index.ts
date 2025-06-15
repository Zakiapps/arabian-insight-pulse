
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url, token } = await req.json();
    if (!url || !token) {
      return new Response(JSON.stringify({ ok: false, message: "Missing URL or token" }), { headers: corsHeaders, status: 400 });
    }
    // Try GET with Authorization header to test if HuggingFace model responds OK
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: "test" })
    });
    if (response.ok) {
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    } else {
      let obj: any = {};
      try { obj = await response.json(); } catch {}
      return new Response(JSON.stringify({
        ok: false,
        message: obj.error || obj.message || response.statusText || "Connection failed"
      }), { headers: corsHeaders, status: 400 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, message: err.message || "Unexpected error" }), { headers: corsHeaders, status: 500 });
  }
});
