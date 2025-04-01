
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
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({ error: "User ID is required" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the connection from the database
    const { data: connection, error: fetchError } = await supabase
      .from("hubspot_connections")
      .select("refresh_token")
      .eq("user_id", user_id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching connection:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch connection" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (connection?.refresh_token) {
      try {
        // Revoke the refresh token
        const revokeUrl = 'https://api.hubapi.com/oauth/v1/refresh-tokens';
        
        if (!HUBSPOT_CLIENT_ID || !HUBSPOT_CLIENT_SECRET) {
          throw new Error("HubSpot API credentials not configured");
        }
        
        // Create basic auth header
        const auth = btoa(`${HUBSPOT_CLIENT_ID}:${HUBSPOT_CLIENT_SECRET}`);
        
        await fetch(`${revokeUrl}/${connection.refresh_token}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          }
        });
        console.log("Successfully revoked HubSpot token");
      } catch (revokeError) {
        console.error("Error revoking token:", revokeError);
        // Continue with deletion even if token revocation fails
      }
    }

    // Delete the connection record
    const { error: deleteError } = await supabase
      .from("hubspot_connections")
      .delete()
      .eq("user_id", user_id);
      
    if (deleteError) {
      console.error("Error deleting connection:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete connection record" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
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
