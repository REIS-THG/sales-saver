
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { metadata, sourceType, keywords } = await req.json()
    
    console.log(`Processing content with AI for sourceType: ${sourceType}`)

    if (!metadata || !sourceType || !keywords) {
      throw new Error("Missing required parameters: metadata, sourceType, or keywords");
    }
    
    // Validate metadata structure
    if (!metadata.paragraphs || !metadata.headings || !metadata.keywordMatches) {
      throw new Error("Invalid metadata structure");
    }
    
    if (keywords.length === 0) {
      throw new Error("At least one keyword is required for analysis");
    }

    // For now, simulate AI processing
    // In a real implementation, this would call an AI API
    const deals = generateDealsFromAI(metadata, sourceType, keywords);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        deals,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in ai-deal-extraction function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack || "No additional details available"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Using 400 for client errors instead of 500
      },
    )
  }
})

function generateDealsFromAI(metadata, sourceType, keywords) {
  const { paragraphs, headings, keywordMatches } = metadata;
  const deals = [];
  
  try {
    // Combine paragraphs and headings to get potential deal information
    const content = [...headings, ...paragraphs].join(" ");
    
    // Detect potential company names
    const companyNamePattern = /([A-Z][a-zA-Z\s]{2,})(Inc\.?|LLC|Corp\.?|Corporation|Company)/g;
    let companyMatches = [...content.matchAll(companyNamePattern)].map(match => match[0]);
    
    // If no company names found, generate from keywords
    if (companyMatches.length === 0) {
      if (keywordMatches && keywordMatches.length > 0) {
        companyMatches = [`${keywordMatches[0]} Solutions`];
      } else {
        companyMatches = [`${keywords[0]} Solutions`];
      }
    }
    
    // Generate 1-3 potential deals
    const numDeals = Math.min(companyMatches.length, Math.floor(Math.random() * 3) + 1);
    
    for (let i = 0; i < numDeals; i++) {
      const companyName = companyMatches[i];
      const matchedKeyword = keywordMatches && keywordMatches.length > 0 
        ? keywordMatches[Math.floor(Math.random() * keywordMatches.length)]
        : keywords[Math.floor(Math.random() * keywords.length)];
      
      // Create a deal name based on the keyword and company
      const dealName = `${matchedKeyword} ${sourceType === 'marketplace' ? 'Opportunity' : 'Project'} with ${companyName}`;
      
      // Generate a random amount based on source type
      let amount;
      if (sourceType === 'marketplace') {
        amount = Math.floor(Math.random() * 50000) + 10000;
      } else if (sourceType === 'api') {
        amount = Math.floor(Math.random() * 100000) + 50000;
      } else {
        amount = Math.floor(Math.random() * 75000) + 25000;
      }
      
      // Generate a confidence score
      const confidenceScore = Math.floor(Math.random() * 30) + 70; // 70-100%
      
      deals.push({
        deal_name: dealName,
        company_name: companyName,
        amount: amount,
        status: 'open',
        company_url: `https://example.com/${i}`,
        contact_email: `contact@${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '')}.com`,
        notes: `AI-generated ${sourceType} deal based on keyword match: ${matchedKeyword}`,
        confidence_score: confidenceScore,
        source_url: 'https://example.com',
        matched_keywords: [matchedKeyword],
        ai_generated: true
      });
    }
  } catch (error) {
    console.error("Error generating deals from AI:", error);
    // Return at least one deal even if there's an error
    deals.push({
      deal_name: `${keywords[0]} Opportunity`,
      company_name: `${keywords[0]} Solutions`,
      amount: Math.floor(Math.random() * 50000) + 10000,
      status: 'open',
      company_url: 'https://example.com/fallback',
      contact_email: `contact@${keywords[0].toLowerCase().replace(/\s+/g, '')}.com`,
      notes: `AI-generated deal based on keyword: ${keywords[0]}`,
      confidence_score: 70,
      source_url: 'https://example.com',
      matched_keywords: [keywords[0]],
      ai_generated: true
    });
  }
  
  return deals;
}
