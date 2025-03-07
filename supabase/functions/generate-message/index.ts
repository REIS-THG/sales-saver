
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
  isDripCampaign?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dealId, communicationType, toneSettings, isDripCampaign = false } = await req.json() as GenerateMessageRequest;

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

    if (isDripCampaign) {
      // Generate a drip campaign with 4 messages
      const dripCampaignPrompt = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert sales communication assistant. Generate a 4-part drip campaign as ${communicationType} messages with:
              - Formality level: ${toneSettings.formality}%
              - Persuasiveness level: ${toneSettings.persuasiveness}%
              - Urgency level: ${toneSettings.urgency}%
              
              The drip campaign should consist of 4 separate messages that build on each other:
              1. Initial outreach - introduce value proposition
              2. Follow-up with additional insights
              3. Case study or social proof message
              4. Final call to action
              
              Base the messages on the following insights and deal information.`
          },
          {
            role: "user",
            content: `Deal: ${deal.deal_name}
              Company: ${deal.company_name}
              Contact: ${deal.contact_first_name} ${deal.contact_last_name}
              
              Insights:
              ${insights.map(insight => `${insight.insight_type}: ${insight.content}`).join('\n')}
              
              Generate a 4-part drip campaign of ${communicationType} messages that build on each other, incorporating these insights and following the tone settings.`
          }
        ]
      }

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dripCampaignPrompt)
      })

      const response = await openAIResponse.json()
      const generatedMessages = response.choices[0].message.content

      // Process the generated content to split into 4 separate messages
      const messagePattern = /\d\.\s+(Initial outreach|Follow-up|Case study|Final call|.*?)(?=\n\d\.|\n*$)/gs;
      const messagesArray = [];
      let match;
      
      while ((match = messagePattern.exec(generatedMessages)) !== null) {
        messagesArray.push(match[0].trim());
      }

      // If we don't have exactly 4 messages, split content more simply
      if (messagesArray.length !== 4) {
        console.log("Couldn't extract 4 distinct messages, falling back to simple splitting");
        const content = generatedMessages.split(/\n\d\.\s+/);
        messagesArray.length = 0;
        
        // Skip the first element if it's empty
        const startIndex = content[0].trim() === '' ? 1 : 0;
        
        for (let i = startIndex; i < Math.min(startIndex + 4, content.length); i++) {
          messagesArray.push(`${i - startIndex + 1}. ${content[i].trim()}`);
        }
      }

      // If we still don't have 4 messages, pad with placeholders
      while (messagesArray.length < 4) {
        messagesArray.push(`Message ${messagesArray.length + 1}: Unable to generate this part of the drip campaign.`);
      }

      return new Response(
        JSON.stringify({ messages: messagesArray }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Original single message generation
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
    }
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
