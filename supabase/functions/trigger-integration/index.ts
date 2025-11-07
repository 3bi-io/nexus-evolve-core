import { corsHeaders } from '../_shared/cors.ts';
import { createAuthenticatedClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

interface TriggerRequest {
  integrationId: string;
  data: any;
  agentId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('trigger-integration', requestId);
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('MISSING_AUTH_HEADER');
    }

    const { supabase, user } = await createAuthenticatedClient(authHeader);
    const body: TriggerRequest = await req.json();

    validateRequiredFields(body, ['integrationId', 'data']);
    validateString(body.integrationId, 'integrationId');

    const { integrationId, data, agentId } = body;

    logger.info('Triggering integration', { integrationId, userId: user.id, hasAgentId: !!agentId });

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

        logger.info('Sending webhook', { url: webhookUrl });

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
      logger.error('Integration trigger error', error);
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

    logger.info('Integration trigger completed', { status, executionTime });

    return successResponse(requestId, {
      success: status === 'success',
      response: responseData,
      executionTime,
    });
  } catch (error) {
    logger.error('Integration trigger failed', error);
    return handleError(error, requestId);
  }
});
