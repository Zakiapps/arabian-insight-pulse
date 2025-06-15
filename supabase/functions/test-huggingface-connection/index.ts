
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supported models and their custom endpoints/tokens (for demo—should come from config/db in prod)
const modelConfigs: Record<string, { url: string; apiKey: string; realModel?: string }> = {
  // Custom endpoints for certain models (as in your typescript logic)
  "Qwen/Qwen2.5-Coder-32B-Instruct": {
    url: "https://mfey12szez9peox8.us-east-1.aws.endpoints.huggingface.cloud/v1",
    apiKey: "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",
    realModel: "Qwen2-5-Coder-32B-Instruct",
  },
  "NousResearch/Hermes-3-Llama-3.1-8B": {
    url: "https://j5d3uzrla2th3m4i.us-east-1.aws.endpoints.huggingface.cloud/v1",
    apiKey: "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",
    realModel: "Qwen/Qwen2.5-Coder-7B-Instruct",
  },
  // Add your other custom models as needed...
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
    // Accept model, url, token in the request
    const { model, url, token } = await req.json();

    log("Received test request", { model, url, withToken: !!token });

    let testUrl = url;
    let testToken = token;
    let testedModel = model;

    // If model has special config, override url/token
    if (model && modelConfigs[model]) {
      testUrl = modelConfigs[model].url;
      testToken = modelConfigs[model].apiKey;
      if (modelConfigs[model].realModel) {
        testedModel = modelConfigs[model].realModel;
      }
      log(`Using custom config for model ${model}`, testUrl);
    }

    // Validate the URL and token
    if (!testUrl || typeof testUrl !== "string" || !testUrl.startsWith("https://")) {
      log("Invalid or missing URL");
      return new Response(JSON.stringify({ ok: false, message: "Invalid or missing URL" }), { headers: corsHeaders, status: 400 });
    }
    if (!testToken || typeof testToken !== "string" || !testToken.startsWith("hf_")) {
      log("Invalid or missing token");
      return new Response(JSON.stringify({ ok: false, message: "Invalid or missing Hugging Face token (should start with hf_...)" }), { headers: corsHeaders, status: 400 });
    }

    // Determine if this is a /v1/chat/completions type endpoint
    let payload: Record<string, unknown>;
    if (testUrl.endsWith('/v1/chat/completions') || testUrl.includes('/v1/chat/completions')) {
      payload = {
        messages: [
          { role: "system", content: "You are a helpful coding assistant." },
          { role: "user", content: "Write a Python function to reverse a string." }
        ],
        max_tokens: 8000,
        temperature: 0
      };
      // For some endpoints a model field may be required
      if (testedModel) payload["model"] = testedModel;
    } else if (testUrl.endsWith('/v1') || testUrl.includes('/v1/')) {
      // Generic OpenAI-compatible logic
      payload = {
        model: testedModel,
        messages: [
          { role: "user", content: "Hello" }
        ]
      };
    } else {
      // Default/inference API minimal logic
      payload = { inputs: "test", options: { wait_for_model: false } };
    }

    let response;
    try {
      response = await fetch(testUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${testToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      log("Error connecting to Hugging Face:", err.message || err);
      return new Response(JSON.stringify({
        ok: false,
        message: "Could not connect to the Hugging Face endpoint; check your URL."
      }), { headers: corsHeaders, status: 500 });
    }

    log("Hugging Face endpoint status", response.status, response.statusText);

    let hfResponseText = "";
    let hfResponseObj: any = {};
    if (!response.ok) {
      try {
        hfResponseText = await response.text();
        hfResponseObj = JSON.parse(hfResponseText);
      } catch (_) {
        hfResponseObj = {};
      }
      log("Hugging Face response not OK", response.status, response.statusText, { hfResponseObj, hfResponseText });
      return new Response(JSON.stringify({
        ok: false,
        message: hfResponseObj.error || hfResponseObj.message || response.statusText || "Connection failed",
        status: response.status,
        checkedModel: model,
        checkedUrl: testUrl,
        hfResponse: hfResponseText
      }), { headers: corsHeaders, status: 400 });
    }

    log("Hugging Face response OK");

    return new Response(JSON.stringify({
      ok: true,
      checkedModel: model,
      checkedUrl: testUrl,
    }), { headers: corsHeaders });
  } catch (err) {
    log("Unhandled error", err.message || err);
    return new Response(JSON.stringify({ ok: false, message: err.message || "Unexpected error" }), { headers: corsHeaders, status: 500 });
  }
});
