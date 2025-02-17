
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealId } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch deal data and related notes
    const { data: deal, error: dealError } = await supabaseClient
      .from('deals')
      .select(`
        *,
        deal_notes (*)
      `)
      .eq('id', dealId)
      .single();

    if (dealError) throw dealError;

    // Analyze deal data using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI sales advisor that analyzes deal data and provides insights. 
            Generate 4 types of insights: opportunities, risks, actions, and trends.
            For each insight, provide a confidence score (0-100) based on the available data.
            Format response as JSON array with objects containing: type, content, confidence_score`
          },
          {
            role: 'user',
            content: `Analyze this deal data and provide insights:\n${JSON.stringify(deal)}`
          }
        ],
      }),
    });

    const aiResponse = await response.json();
    const insights = JSON.parse(aiResponse.choices[0].message.content);

    // Store insights in database
    const { error: insertError } = await supabaseClient
      .from('deal_insights')
      .insert(
        insights.map((insight: any) => ({
          deal_id: dealId,
          insight_type: insight.type,
          content: insight.content,
          confidence_score: insight.confidence_score,
          source_data: deal,
          is_processed: false
        }))
      );

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
