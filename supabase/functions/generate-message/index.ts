
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateMessageRequest {
  dealId: string;
  communicationType: 'email' | 'message' | 'call_script';
  toneSettings: {
    formality: number;
    persuasiveness: number;
    urgency: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dealId, communicationType, toneSettings } = await req.json() as GenerateMessageRequest;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch deal insights
    const { data: insights, error: insightsError } = await supabaseClient
      .from('deal_insights')
      .select('*')
      .eq('deal_id', dealId)

    if (insightsError) {
      throw new Error('Failed to fetch insights')
    }

    // Fetch deal details
    const { data: deal, error: dealError } = await supabaseClient
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single()

    if (dealError) {
      throw new Error('Failed to fetch deal details')
    }

    // Prepare message using OpenAI
    const messagePrompt = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert sales communication assistant. Generate a ${communicationType} with:
            - Formality level: ${toneSettings.formality}%
            - Persuasiveness level: ${toneSettings.persuasiveness}%
            - Urgency level: ${toneSettings.urgency}%
            
            Base the message on the following insights and deal information.`
        },
        {
          role: "user",
          content: `Deal: ${deal.deal_name}
            Company: ${deal.company_name}
            Contact: ${deal.contact_first_name} ${deal.contact_last_name}
            
            Insights:
            ${insights.map(insight => `${insight.insight_type}: ${insight.content}`).join('\n')}
            
            Generate a ${communicationType} incorporating these insights and following the tone settings.`
        }
      ]
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePrompt)
    })

    const response = await openAIResponse.json()
    const generatedMessage = response.choices[0].message.content

    return new Response(
      JSON.stringify({ message: generatedMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
