
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Get Supabase connection details from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AutomationSettings {
  enableTimeDecay: boolean;
  timeDecayRate: number;
  enableActivityBoost: boolean;
  activityBoostRate: number;
  enableAutoStatusChange: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Process all deals for automation
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, deal_automation_settings');

    if (usersError) throw usersError;

    let totalUpdates = 0;
    const results = [];

    for (const user of users) {
      if (!user.deal_automation_settings) continue;
      
      const settings = user.deal_automation_settings as AutomationSettings;
      
      // Only process deals if user has enabled automation
      if (!settings.enableTimeDecay && !settings.enableActivityBoost) continue;
      
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.user_id)
        .in('status', ['open', 'stalled']);
      
      if (dealsError) throw dealsError;
      
      for (const deal of deals) {
        let newHealthScore = deal.health_score || 50;
        let changes = [];
        
        // Apply time decay
        if (settings.enableTimeDecay) {
          const lastUpdate = new Date(deal.updated_at);
          const now = new Date();
          const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Apply decay per week of inactivity
          if (daysSinceUpdate >= 7) {
            const weeksInactive = Math.floor(daysSinceUpdate / 7);
            const decayAmount = weeksInactive * settings.timeDecayRate;
            newHealthScore = Math.max(newHealthScore - decayAmount, 0);
            changes.push(`Time decay: -${decayAmount}%`);
          }
        }
        
        // Check if health score changed
        if (newHealthScore !== deal.health_score) {
          const { error: updateError } = await supabase
            .from('deals')
            .update({ health_score: newHealthScore })
            .eq('id', deal.id);
          
          if (updateError) throw updateError;
          
          totalUpdates++;
          results.push({
            deal_id: deal.id,
            deal_name: deal.deal_name,
            previous_health: deal.health_score,
            new_health: newHealthScore,
            changes
          });
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated health scores for ${totalUpdates} deals`,
        results
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
