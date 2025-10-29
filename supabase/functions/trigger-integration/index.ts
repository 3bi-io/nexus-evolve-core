import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TriggerRequest {
  integrationId: string;
  data: any;
  agentId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: TriggerRequest = await req.json();
    const { integrationId, data, agentId } = body;

    console.log('Triggering integration:', { integrationId, user: user.id, agentId });

    // Fetch integration
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('user_id', user.id)
      .single();

    if (integrationError || !integration || !integration.is_active) {
      throw new Error('Integration not found or inactive');
    }

    let responseData: any = null;
    let status = 'success';
    let errorMessage: string | null = null;

    try {
      // Trigger the webhook/integration
      if (integration.integration_type === 'zapier' || integration.integration_type === 'make' || integration.integration_type === 'webhook') {
        const webhookUrl = integration.webhook_url;
        if (!webhookUrl) {
          throw new Error('Webhook URL not configured');
        }

        const payload = {
          timestamp: new Date().toISOString(),
          user_id: user.id,
          agent_id: agentId,
          integration_id: integrationId,
          integration_name: integration.name,
          data: data,
          ...integration.config,
        };

        console.log('Sending webhook to:', webhookUrl);

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (webhookResponse.ok) {
          try {
            responseData = await webhookResponse.json();
          } catch {
            responseData = { status: webhookResponse.status, statusText: webhookResponse.statusText };
          }
        } else {
          throw new Error(`Webhook failed with status ${webhookResponse.status}`);
        }
      } else if (integration.integration_type === 'api') {
        // Custom API integration logic here
        responseData = { message: 'API integration executed' };
      }

      // Update integration stats
      await supabase
        .from('user_integrations')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: integration.trigger_count + 1,
        })
        .eq('id', integrationId);

    } catch (error: any) {
      status = 'failed';
      errorMessage = error.message;
      console.error('Integration trigger error:', error);
    }

    const executionTime = Date.now() - startTime;

    // Log trigger
    await supabase.from('integration_triggers').insert({
      integration_id: integrationId,
      user_id: user.id,
      agent_id: agentId,
      trigger_data: data,
      response_data: responseData,
      status,
      error_message: errorMessage,
      execution_time_ms: executionTime,
    });

    return new Response(
      JSON.stringify({
        success: status === 'success',
        response: responseData,
        executionTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Trigger integration error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
