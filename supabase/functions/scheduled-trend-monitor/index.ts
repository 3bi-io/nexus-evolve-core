import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { validateRequiredFields, validateString } from '../_shared/validators.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('scheduled-trend-monitor', requestId);

  try {
    const supabase = initSupabaseClient();
    const body = await req.json();

    validateRequiredFields(body, ['monitorId']);
    validateString(body.monitorId, 'monitorId');

    const { monitorId } = body;

    logger.info('Executing scheduled monitor', { monitorId });

    // Fetch monitor configuration
    const { data: monitor, error: monitorError } = await supabase
      .from('scheduled_monitors')
      .select('*')
      .eq('id', monitorId)
      .single();

    if (monitorError || !monitor) {
      throw new Error('Monitor not found');
    }

    logger.info('Monitor fetched', { type: monitor.monitor_type, target: monitor.target });

    let results: any = {};
    let alerts: any[] = [];
    let status = 'success';

    try {
      // Execute monitoring based on type
      switch (monitor.monitor_type) {
        case 'trends':
          const { data: grokTrends } = await supabase.functions.invoke('grok-reality-agent', {
            body: {
              query: `Find trending topics and discussions about ${monitor.target}. Include sentiment, volume, and key insights.`,
              mode: 'search',
              userId: monitor.user_id,
            },
          });

          results = {
            trends: grokTrends?.results || [],
            sentiment: grokTrends?.sentiment || 'neutral',
            volume: grokTrends?.volume || 0,
          };

          // Check alert thresholds
          if (monitor.alert_threshold) {
            const threshold = monitor.alert_threshold as any;
            if (threshold.volume && results.volume > threshold.volume) {
              alerts.push({
                type: 'volume_spike',
                message: `High volume detected: ${results.volume} mentions`,
                severity: 'high',
              });
              status = 'alert_triggered';
            }
            if (threshold.sentiment && results.sentiment === 'negative' && threshold.sentiment === 'negative') {
              alerts.push({
                type: 'negative_sentiment',
                message: 'Negative sentiment detected',
                severity: 'medium',
              });
              status = 'alert_triggered';
            }
          }
          break;

        case 'sentiment':
          const { data: sentimentData } = await supabase.functions.invoke('grok-reality-agent', {
            body: {
              query: `Analyze the current sentiment and public perception of ${monitor.target}. Provide detailed sentiment breakdown.`,
              mode: 'reasoning',
              userId: monitor.user_id,
            },
          });

          results = {
            sentiment: sentimentData?.sentiment || 'neutral',
            score: sentimentData?.score || 0,
            breakdown: sentimentData?.breakdown || {},
          };
          break;

        case 'competitor':
          const { data: competitorData } = await supabase.functions.invoke('grok-reality-agent', {
            body: {
              query: `Research recent news, updates, and activities from ${monitor.target}. Focus on product launches, announcements, and market moves.`,
              mode: 'search',
              userId: monitor.user_id,
            },
          });

          results = {
            updates: competitorData?.results || [],
            summary: competitorData?.summary || '',
          };
          break;

        case 'keyword':
          const { data: keywordData } = await supabase.functions.invoke('grok-reality-agent', {
            body: {
              query: `Find recent mentions and discussions about "${monitor.target}". Include context and sentiment.`,
              mode: 'search',
              userId: monitor.user_id,
            },
          });

          results = {
            mentions: keywordData?.results || [],
            count: keywordData?.count || 0,
          };
          break;

        case 'brand':
          const { data: brandData } = await supabase.functions.invoke('grok-reality-agent', {
            body: {
              query: `Comprehensive brand analysis for ${monitor.target}: sentiment, mentions, trending topics, and brand health indicators.`,
              mode: 'search',
              userId: monitor.user_id,
            },
          });

          results = {
            brandHealth: brandData?.brandHealth || {},
            mentions: brandData?.mentions || [],
            sentiment: brandData?.sentiment || 'neutral',
            trends: brandData?.trends || [],
          };
          break;
      }

      // Store results
      await supabase.from('monitor_results').insert({
        monitor_id: monitorId,
        status,
        results,
        alerts,
        metrics: {
          data_points: Array.isArray(results.trends) ? results.trends.length : 0,
          execution_time: Date.now(),
        },
      });

      // Update monitor last run
      await supabase
        .from('scheduled_monitors')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', monitorId);

      // Send notifications if alerts triggered
      if (alerts.length > 0 && monitor.notification_channels) {
        logger.info('Alerts triggered', { count: alerts.length });
      }

      logger.info('Monitor execution completed', { status, alertCount: alerts.length });

      return successResponse({ status, results, alerts }, requestId);
    } catch (execError) {
      logger.error('Monitor execution failed', execError);

      await supabase.from('monitor_results').insert({
        monitor_id: monitorId,
        status: 'failed',
        results: {},
        error_message: execError instanceof Error ? execError.message : 'Unknown error',
      });

      throw execError;
    }
  } catch (error) {
    logger.error('Scheduled monitor failed', error);
    return handleError({ functionName: 'scheduled-trend-monitor', error, requestId });
  }
});
