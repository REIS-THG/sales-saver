
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    const { email, teamId } = await req.json()
    
    if (!email || !teamId) {
      return new Response(
        JSON.stringify({ error: 'Email and teamId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if invitation exists and is valid
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('team_invitations')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'No valid invitation found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Add user to team members
    const { error: memberError } = await supabaseClient
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: invitation.role,
        status: 'active'
      })

    if (memberError) {
      return new Response(
        JSON.stringify({ error: memberError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabaseClient
      .from('team_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
