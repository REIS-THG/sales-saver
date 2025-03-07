import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { dealId, dealData } = await req.json();

    // Verify user's subscription status
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split('Bearer ')[1] ?? ''
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: userData, error: userDataError } = await supabaseClient
      .from('users')
      .select('subscription_status')
      .eq('user_id', user.id)
      .single();

    if (userDataError) {
      throw new Error('Failed to fetch user data');
    }

    // Fix: Check for boolean 'true' value in subscription_status
    if (userData?.subscription_status !== true) {
      throw new Error('This feature requires a Pro subscription');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a professional invoice for the following deal:
    Deal Name: ${dealData.deal_name}
    Company: ${dealData.company_name}
    Amount: $${dealData.amount}
    Start Date: ${dealData.start_date}
    Expected Close Date: ${dealData.expected_close_date}
    Contact: ${dealData.contact_first_name} ${dealData.contact_last_name}

    Please include:
    1. Invoice Number
    2. Bill To Information
    3. Service Description
    4. Amount Details
    5. Payment Terms
    6. Due Date`;

    console.log('Sending prompt to OpenAI for invoice generation');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional invoice generator. Create clear and professional invoices.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const result = await response.json();
    console.log('OpenAI response received for invoice');
    
    if (!result.choices || result.choices.length === 0) {
      console.error('Invalid OpenAI response:', result);
      throw new Error('Invalid response from OpenAI');
    }
    
    const invoiceText = result.choices[0].message.content;

    // Still save to database for record keeping
    const { error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        document_type: 'invoice',
        content: invoiceText,
      });

    if (insertError) {
      console.error('Error storing invoice:', insertError);
    }

    return new Response(
      JSON.stringify({ success: true, invoice: invoiceText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    console.error('Error in generate-invoice function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
