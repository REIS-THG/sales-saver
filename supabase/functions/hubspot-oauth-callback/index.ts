
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get secrets from environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const HUBSPOT_CLIENT_ID = Deno.env.get("HUBSPOT_CLIENT_ID") || "";
const HUBSPOT_CLIENT_SECRET = Deno.env.get("HUBSPOT_CLIENT_SECRET") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirect_uri } = await req.json();
    
    if (!code) {
      return new Response(JSON.stringify({ error: "Authorization code is required" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!HUBSPOT_CLIENT_ID || !HUBSPOT_CLIENT_SECRET) {
      console.error("Missing HubSpot API credentials");
      return new Response(JSON.stringify({ error: "HubSpot API credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: HUBSPOT_CLIENT_ID,
      client_secret: HUBSPOT_CLIENT_SECRET,
      redirect_uri: redirect_uri,
      code: code
    });

    console.log(`Exchanging code for token with redirect URI: ${redirect_uri}`);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error("HubSpot token error:", tokenData);
      return new Response(JSON.stringify({ error: tokenData.error_description || "Failed to get token" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Return the token data to the client
    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      hub_domain: tokenData.hub_domain,
      portal_id: tokenData.hub_id,
      expires_in: tokenData.expires_in
    }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
