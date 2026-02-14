import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SIIGO_API = "https://api.siigo.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, username, access_key, partner_id, token, products } = body;

    if (action === "auth") {
      const res = await fetch(`${SIIGO_API}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Partner-Id": partner_id || "LovableSiigoUploader",
        },
        body: JSON.stringify({ username, access_key }),
      });
      const data = await res.json();
      if (!res.ok) {
        return new Response(JSON.stringify({ error: data }), {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_products") {
      if (!token || !products || !Array.isArray(products)) {
        return new Response(
          JSON.stringify({ error: "token and products array required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results: Array<{ code: string; success: boolean; data?: unknown; error?: unknown }> = [];

      for (const product of products) {
        try {
          const res = await fetch(`${SIIGO_API}/v1/products`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
              "Partner-Id": partner_id || "LovableSiigoUploader",
            },
            body: JSON.stringify(product),
          });
          const data = await res.json();
          results.push({
            code: product.code,
            success: res.ok,
            data: res.ok ? data : undefined,
            error: res.ok ? undefined : data,
          });
        } catch (err) {
          results.push({
            code: product.code,
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
