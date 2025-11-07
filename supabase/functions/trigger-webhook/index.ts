import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

interface WebhookPayload {
  event: string;
  data: any;
  user_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('trigger-webhook', requestId);

  try {
    const supabase = initSupabaseClient();
    const body: WebhookPayload = await req.json();

    validateRequiredFields(body, ['event', 'data']);
    validateString(body.event, 'event');

    const { event, data, user_id } = body;

    logger.info('Processing webhook trigger', { event, hasUserId: !!user_id });

    // Get all active webhooks subscribed to this event
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [event]);

    if (webhooksError) {
      logger.error('Failed to fetch webhooks', webhooksError);
      throw webhooksError;
    }

    // Filter webhooks by user_id if provided
    const targetWebhooks = user_id
      ? webhooks.filter(wh => wh.user_id === user_id)
      : webhooks;

    logger.info('Found webhooks', { count: targetWebhooks.length });

    // Trigger each webhook
    const results = await Promise.allSettled(
      targetWebhooks.map(async (webhook) => {
        const deliveryId = crypto.randomUUID();
        
        // Create delivery record
        await supabase.from('webhook_deliveries').insert({
          id: deliveryId,
          webhook_id: webhook.id,
          event_type: event,
          payload: data,
          attempts: 0,
        });

        // Prepare webhook payload
        const webhookPayload = {
          id: deliveryId,
          event,
          timestamp: new Date().toISOString(),
          data,
        };

        // Create signature
        const encoder = new TextEncoder();
        const keyData = encoder.encode(webhook.secret);
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(JSON.stringify(webhookPayload))
        );
        const signatureHex = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Send webhook
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), webhook.timeout_seconds * 1000);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': signatureHex,
              'X-Webhook-ID': deliveryId,
              'X-Webhook-Event': event,
              ...webhook.headers,
            },
            body: JSON.stringify(webhookPayload),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          const responseBody = await response.text();

          // Update delivery record
          await supabase
            .from('webhook_deliveries')
            .update({
              response_status: response.status,
              response_body: responseBody.substring(0, 1000),
              delivered_at: new Date().toISOString(),
              attempts: 1,
            })
            .eq('id', deliveryId);

          if (!response.ok) {
            logger.warn('Webhook delivery failed', { webhookId: webhook.id, status: response.status });
            
            // Schedule retry if within retry count
            if (webhook.retry_count > 0) {
              await supabase
                .from('webhook_deliveries')
                .update({
                  next_retry_at: new Date(Date.now() + 60000).toISOString(),
                })
                .eq('id', deliveryId);
            }
          } else {
            logger.info('Webhook delivered successfully', { webhookId: webhook.id });
          }

          return { webhook_id: webhook.id, success: response.ok };
        } catch (error) {
          logger.error('Webhook delivery error', { webhookId: webhook.id, error });
          
          // Update delivery record with error
          await supabase
            .from('webhook_deliveries')
            .update({
              response_status: 0,
              response_body: error instanceof Error ? error.message : 'Unknown error',
              attempts: 1,
              next_retry_at: new Date(Date.now() + 60000).toISOString(),
            })
            .eq('id', deliveryId);

          return { webhook_id: webhook.id, success: false, error };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    logger.info('Webhook triggering completed', { 
      total: targetWebhooks.length, 
      successful: successCount 
    });

    return successResponse(requestId, {
      message: `Triggered ${targetWebhooks.length} webhooks, ${successCount} delivered successfully`,
      total: targetWebhooks.length,
      successful: successCount,
    });
  } catch (error) {
    logger.error('Webhook trigger failed', error);
    return handleError(error, requestId);
  }
});
