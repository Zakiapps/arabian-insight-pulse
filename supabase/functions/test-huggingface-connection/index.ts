
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function log(...args: unknown[]) {
  // deno-lint-ignore no-console
  console.log("[test-huggingface-connection]", ...args);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url, token } = await req.json();

    log("Received test request", { url, withToken: !!token });

    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      log("Invalid or missing URL");
      return new Response(JSON.stringify({ ok: false, message: "Invalid or missing URL" }), { headers: corsHeaders, status: 400 });
    }
    if (!token || typeof token !== "string" || !token.startsWith("hf_")) {
      log("Invalid or missing token");
      return new Response(JSON.stringify({ ok: false, message: "Invalid or missing Hugging Face token (should start with hf_...)" }), { headers: corsHeaders, status: 400 });
    }

    const hfReqBody = { inputs: "test" };

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(hfReqBody)
      });
    } catch (err) {
      log("Error connecting to Hugging Face:", err.message || err);
      return new Response(JSON.stringify({
        ok: false,
        message: "Could not connect to the Hugging Face endpoint; check your URL."
      }), { headers: corsHeaders, status: 500 });
    }

    log("Hugging Face endpoint status", response.status, response.statusText);

    if (!response.ok) {
      let obj: any = {};
      let responseText = "";
      try {
        responseText = await response.text();
        obj = JSON.parse(responseText);
      } catch (_) {
        obj = {};
      }
      log("Hugging Face response not OK", response.status, response.statusText, { obj, responseText });
      return new Response(JSON.stringify({
        ok: false,
        message: obj.error || obj.message || response.statusText || "Connection failed",
        status: response.status,
        hfResponse: responseText
      }), { headers: corsHeaders, status: 400 });
    }

    log("Hugging Face response OK");
    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (err) {
    log("Unhandled error", err.message || err);
    return new Response(JSON.stringify({ ok: false, message: err.message || "Unexpected error" }), { headers: corsHeaders, status: 500 });
  }
});
