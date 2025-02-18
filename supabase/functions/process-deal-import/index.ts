
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')
    const teamId = formData.get('teamId')

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or user ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create bulk import record
    const { data: importRecord, error: importError } = await supabase
      .from('bulk_imports')
      .insert({
        user_id: userId,
        filename: file.name,
        status: 'processing'
      })
      .select()
      .single()

    if (importError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create import record', details: importError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const text = await file.text()
    const records = parse(text, { skipFirstRow: true })
    const totalRecords = records.length
    let successCount = 0
    let errorCount = 0
    const errors = []

    // Update total records count
    await supabase
      .from('bulk_imports')
      .update({ total_records: totalRecords })
      .eq('id', importRecord.id)

    // Process each row
    for (const [index, record] of records.entries()) {
      try {
        const [
          deal_name,
          company_name,
          amount,
          status,
          contact_email,
          contact_first_name,
          contact_last_name,
          company_url,
          notes,
          expected_close_date
        ] = record

        const { error: dealError } = await supabase
          .from('deals')
          .insert({
            deal_name,
            company_name,
            amount: parseFloat(amount) || 0,
            status: status || 'open',
            contact_email,
            contact_first_name,
            contact_last_name,
            company_url,
            notes,
            expected_close_date: expected_close_date || null,
            user_id: userId,
            team_id: teamId || null,
            health_score: 50
          })

        if (dealError) {
          errorCount++
          errors.push({ row: index + 2, error: dealError.message })
        } else {
          successCount++
        }

        // Update progress every 10 records
        if (index % 10 === 0) {
          await supabase
            .from('bulk_imports')
            .update({
              processed_records: index + 1,
              success_count: successCount,
              error_count: errorCount,
              errors
            })
            .eq('id', importRecord.id)
        }
      } catch (error) {
        errorCount++
        errors.push({ row: index + 2, error: error.message })
      }
    }

    // Update final status
    await supabase
      .from('bulk_imports')
      .update({
        status: 'completed',
        processed_records: totalRecords,
        success_count: successCount,
        error_count: errorCount,
        errors
      })
      .eq('id', importRecord.id)

    return new Response(
      JSON.stringify({
        message: 'Import completed',
        totalRecords,
        successCount,
        errorCount,
        errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
