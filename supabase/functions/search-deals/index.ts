
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { keywords, location, dealType, minAmount, maxAmount, startDate, endDate, excludeKeywords, sourceUrls, sourceType } = await req.json()

    console.log(`Search request: ${keywords.join(', ')} (${sourceType})`)
    
    // Different handling based on source type
    let deals = [];
    
    switch (sourceType) {
      case 'website':
        deals = generateWebsiteDeals(keywords, excludeKeywords, sourceUrls, minAmount, maxAmount);
        break;
      case 'marketplace': 
        deals = generateMarketplaceDeals(keywords, location, minAmount, maxAmount);
        break;
      case 'api':
        deals = generateApiDeals(keywords, dealType, minAmount, maxAmount);
        break;
      case 'manual':
        deals = generateManualDeals(keywords, dealType, minAmount, maxAmount);
        break;
      default:
        deals = generateSampleDeals(keywords, location, dealType, minAmount, maxAmount);
    }

    return new Response(
      JSON.stringify({ deals }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in search-deals function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateWebsiteDeals(keywords, excludeKeywords, sourceUrls, minAmount, maxAmount) {
  const deals = [];
  const numDeals = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < numDeals; i++) {
    const amount = Math.floor(Math.random() * (maxAmount - minAmount || 50000)) + (minAmount || 10000);
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    const url = sourceUrls && sourceUrls.length > 0 
      ? sourceUrls[Math.floor(Math.random() * sourceUrls.length)]
      : 'https://example.com';
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    deals.push({
      deal_name: `Website Lead: ${keyword} Opportunity`,
      company_name: `${keyword} Technologies`,
      amount: amount,
      status: 'open',
      company_url: url,
      contact_email: `contact@${keyword.toLowerCase().replace(/\s+/g, '')}tech.com`,
      notes: `Potential web-scraped deal with keyword match: ${keyword}`,
      confidence_score: confidence,
      source_url: url,
      matched_keywords: [keyword],
    });
  }

  return deals;
}

function generateMarketplaceDeals(keywords, location, minAmount, maxAmount) {
  const deals = [];
  const numDeals = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < numDeals; i++) {
    const amount = Math.floor(Math.random() * (maxAmount - minAmount || 50000)) + (minAmount || 10000);
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    deals.push({
      deal_name: `Marketplace: ${keyword} Project ${i + 1}`,
      company_name: `${keyword} ${location || 'Global'} Corp`,
      amount: amount,
      status: 'open',
      company_url: `https://marketplace.example.com/${i}`,
      contact_email: `business@${keyword.toLowerCase().replace(/\s+/g, '')}corp.com`,
      notes: `Marketplace opportunity related to ${keyword}`,
      confidence_score: confidence,
      source_url: 'https://marketplace.example.com',
      matched_keywords: [keyword],
    });
  }

  return deals;
}

function generateApiDeals(keywords, dealType, minAmount, maxAmount) {
  const deals = [];
  const numDeals = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < numDeals; i++) {
    const amount = Math.floor(Math.random() * (maxAmount - minAmount || 100000)) + (minAmount || 50000);
    const confidence = Math.floor(Math.random() * 15) + 85; // 85-100%
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    deals.push({
      deal_name: `API Integration: ${keyword} Solution`,
      company_name: `${keyword} API Systems`,
      amount: amount,
      status: 'open',
      company_url: `https://api.example.com/${i}`,
      contact_email: `api@${keyword.toLowerCase().replace(/\s+/g, '')}systems.com`,
      notes: `API integration deal for ${dealType || keyword} solution`,
      confidence_score: confidence,
      source_url: 'https://api.example.com',
      matched_keywords: [keyword],
    });
  }

  return deals;
}

function generateManualDeals(keywords, dealType, minAmount, maxAmount) {
  const deals = [];
  const numDeals = Math.floor(Math.random() * 2) + 1;

  for (let i = 0; i < numDeals; i++) {
    const amount = Math.floor(Math.random() * (maxAmount - minAmount || 75000)) + (minAmount || 25000);
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    deals.push({
      deal_name: `Manual Lead: ${keyword} ${dealType || 'Opportunity'}`,
      company_name: `${keyword} Solutions`,
      amount: amount,
      status: 'open',
      company_url: 'https://example.com',
      contact_email: `contact@${keyword.toLowerCase().replace(/\s+/g, '')}solutions.com`,
      notes: `Manual lead entry with focus on ${keyword}`,
      confidence_score: confidence,
      source_url: 'https://example.com',
      matched_keywords: [keyword],
    });
  }

  return deals;
}

function generateSampleDeals(keywords, location, dealType, minAmount, maxAmount) {
  const deals = [];
  const numDeals = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < numDeals; i++) {
    const amount = Math.floor(Math.random() * (maxAmount - minAmount || 50000)) + (minAmount || 10000);
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    deals.push({
      deal_name: `${dealType || 'Generic'} Opportunity ${i + 1}`,
      company_name: `${keywords[0] || 'Sample'} ${location || 'Global'} Corp`,
      amount: amount,
      status: 'open',
      company_url: `https://example.com/${i}`,
      contact_email: 'contact@example.com',
      notes: `Potential ${dealType || 'generic'} deal found through AI sourcing`,
      confidence_score: confidence,
      source_url: 'https://example.com',
      matched_keywords: keywords,
    });
  }

  return deals;
}
