
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as docx from "https://esm.sh/docx@8.2.3";
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts";
import { Packer } from "https://esm.sh/docx@8.2.3";

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

    const { dealId, dealData, format = 'text', language = 'en' } = await req.json();

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

    // Check for boolean 'true' value in subscription_status
    if (userData?.subscription_status !== true) {
      throw new Error('This feature requires a Pro subscription');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a professional contract for the following deal:
    Deal Name: ${dealData.deal_name}
    Company: ${dealData.company_name}
    Amount: $${dealData.amount}
    Start Date: ${dealData.start_date}
    Expected Close Date: ${dealData.expected_close_date}
    Contact: ${dealData.contact_first_name} ${dealData.contact_last_name}
    Notes: ${dealData.notes}

    Please create a formal contract that includes standard sections such as:
    1. Parties involved
    2. Scope of work
    3. Payment terms
    4. Timeline
    5. Terms and conditions
    6. Signatures
    Make it detailed but concise.`;

    const systemMessage = language === 'en' 
      ? 'You are a legal document assistant that generates professional contracts. Keep the language formal and legally sound.'
      : `You are a legal document assistant that generates professional contracts. Generate the content in ${language}. Keep the language formal and legally sound.`;

    console.log('Sending prompt to OpenAI for contract generation');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const result = await response.json();
    console.log('OpenAI response received for contract');
    
    if (!result.choices || result.choices.length === 0) {
      console.error('Invalid OpenAI response:', result);
      throw new Error('Invalid response from OpenAI');
    }
    
    const contractText = result.choices[0].message.content;

    // Format as requested (text, docx, pdf)
    let responseData = { success: true };
    let contentType = 'application/json';
    
    if (format === 'docx') {
      // Create DOCX document
      const doc = new docx.Document({
        sections: [{
          properties: {},
          children: [
            new docx.Paragraph({
              text: `CONTRACT: ${dealData.deal_name}`,
              heading: docx.HeadingLevel.HEADING_1,
              spacing: { after: 200 }
            }),
            ...formatDocxContent(contractText)
          ],
        }],
      });

      // Generate document buffer
      const buffer = await Packer.toBuffer(doc);
      const base64Doc = base64Encode(buffer);
      responseData = { 
        ...responseData, 
        contract: base64Doc, 
        filename: `${dealData.deal_name.replace(/\s+/g, '_')}_Contract.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    } else {
      // Default text format
      responseData = { ...responseData, contract: contractText };
    }

    const { error: insertError } = await supabaseClient
      .from('generated_documents')
      .insert({
        deal_id: dealId,
        user_id: user.id,
        document_type: 'contract',
        content: contractText,
      });

    if (insertError) {
      console.error('Error storing contract:', insertError);
    }

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': contentType },
      },
    );

  } catch (error) {
    console.error('Error in generate-contract function:', error);
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

// Helper function to convert text to docx paragraphs
function formatDocxContent(text: string): docx.Paragraph[] {
  const paragraphs: docx.Paragraph[] = [];
  
  // Split the text into sections and paragraphs
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }
    
    // Check if this is a heading (simple heuristic)
    if (trimmedLine.match(/^#+\s/) || trimmedLine.toUpperCase() === trimmedLine) {
      paragraphs.push(
        new docx.Paragraph({
          text: trimmedLine.replace(/^#+\s/, ''),
          heading: docx.HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        })
      );
    } else {
      paragraphs.push(
        new docx.Paragraph({
          text: trimmedLine,
          spacing: { before: 100, after: 100 }
        })
      );
    }
  }
  
  return paragraphs;
}
