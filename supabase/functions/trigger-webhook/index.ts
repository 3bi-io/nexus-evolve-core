import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  data: any;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event, data, user_id }: WebhookPayload = await req.json();

    console.log(`Processing webhook trigger for event: ${event}`);

    // Get all active webhooks subscribed to this event
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [event]);

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      throw webhooksError;
    }

    // Filter webhooks by user_id if provided
    const targetWebhooks = user_id
      ? webhooks.filter(wh => wh.user_id === user_id)
      : webhooks;

    console.log(`Found ${targetWebhooks.length} webhooks to trigger`);

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
              response_body: responseBody.substring(0, 1000), // Limit size
              delivered_at: new Date().toISOString(),
              attempts: 1,
            })
            .eq('id', deliveryId);

          if (!response.ok) {
            console.error(`Webhook ${webhook.id} failed with status ${response.status}`);
            
            // Schedule retry if within retry count
            if (webhook.retry_count > 0) {
              await supabase
                .from('webhook_deliveries')
                .update({
                  next_retry_at: new Date(Date.now() + 60000).toISOString(), // Retry in 1 minute
                })
                .eq('id', deliveryId);
            }
          } else {
            console.log(`Webhook ${webhook.id} delivered successfully`);
          }

          return { webhook_id: webhook.id, success: response.ok };
        } catch (error) {
          console.error(`Error delivering webhook ${webhook.id}:`, error);
          
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

    return new Response(
      JSON.stringify({
        success: true,
        message: `Triggered ${targetWebhooks.length} webhooks, ${successCount} delivered successfully`,
        results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'rejected' }),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in trigger-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
