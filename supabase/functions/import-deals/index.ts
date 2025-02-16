
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { parse as csvParse } from 'https://deno.land/std@0.181.0/encoding/csv.ts'
import { read as xlsxRead, utils as xlsxUtils } from 'https://esm.sh/xlsx@0.18.5'

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

    if (!file) {
      throw new Error('No file uploaded')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create bulk import record
    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.split('Bearer ')[1] ?? ''
    )

    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: importRecord, error: importError } = await supabase
      .from('bulk_imports')
      .insert({
        user_id: user.id,
        filename: (file as File).name,
        status: 'processing'
      })
      .select()
      .single()

    if (importError) throw importError

    // Process file based on type
    const fileBuffer = await (file as File).arrayBuffer()
    let records: any[] = []

    if ((file as File).name.endsWith('.csv')) {
      const text = new TextDecoder().decode(fileBuffer)
      records = await csvParse(text, { skipFirstRow: true })
    } else if ((file as File).name.endsWith('.json')) {
      const text = new TextDecoder().decode(fileBuffer)
      records = JSON.parse(text)
    } else if ((file as File).name.endsWith('.xlsx') || (file as File).name.endsWith('.xls')) {
      const workbook = xlsxRead(fileBuffer)
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      records = xlsxUtils.sheet_to_json(firstSheet)
    }

    // Update total records count
    await supabase
      .from('bulk_imports')
      .update({ total_records: records.length })
      .eq('id', importRecord.id)

    // Process records in batches
    const batchSize = 100
    let successCount = 0
    let errorCount = 0
    const errors: any[] = []

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      
      // Process each record in the batch
      const processedBatch = batch.map(record => ({
        deal_name: record.deal_name || record.dealName || record.name || 'Untitled Deal',
        company_name: record.company_name || record.companyName || record.company || '',
        company_url: record.company_url || record.companyUrl || record.website || '',
        amount: parseFloat(record.amount?.toString().replace(/[^0-9.]/g, '') || '0'),
        status: record.status || 'open',
        contact_first_name: record.contact_first_name || record.contactFirstName || '',
        contact_last_name: record.contact_last_name || record.contactLastName || '',
        contact_email: record.contact_email || record.contactEmail || record.email || '',
        notes: record.notes || record.description || '',
        start_date: new Date().toISOString(),
        expected_close_date: record.expected_close_date || record.expectedCloseDate || null,
        health_score: 50,
        user_id: user.id,
      }))

      // Insert processed records
      const { error: insertError } = await supabase
        .from('deals')
        .insert(processedBatch)

      if (insertError) {
        errorCount += batch.length
        errors.push({ batch: i / batchSize, error: insertError.message })
      } else {
        successCount += batch.length
      }

      // Update progress
      await supabase
        .from('bulk_imports')
        .update({
          processed_records: i + batch.length,
          success_count: successCount,
          error_count: errorCount,
          errors: errors,
        })
        .eq('id', importRecord.id)
    }

    // Update final status
    await supabase
      .from('bulk_imports')
      .update({
        status: errorCount === 0 ? 'completed' : 'completed_with_errors',
      })
      .eq('id', importRecord.id)

    return new Response(
      JSON.stringify({ message: 'Import completed', success: successCount, errors: errorCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
