/**
 * Send Low Credit Alert Function
 * Cron job to notify users when their credits are running low (<10%)
 */

import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient } from '../_shared/supabase-client.ts';
import { createLogger } from '../_shared/logger.ts';
import { handleError, successResponse } from '../_shared/error-handler.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const logger = createLogger('send-low-credit-alert', requestId);

  try {
    logger.info('Starting low credit alert process');

    const supabase = initSupabaseClient();

    // Get all active subscriptions with low credits (< 10% remaining)
    const { data: lowCreditUsers, error: queryError } = await supabase
      .from('user_subscriptions')
      .select(`
        user_id,
        credits_remaining,
        credits_total,
        tier_id,
        subscription_tiers (tier_name)
      `)
      .eq('status', 'active')
      .gt('credits_total', 0);

    if (queryError) throw queryError;

    const usersToNotify = lowCreditUsers?.filter(sub => {
      const percentage = (sub.credits_remaining / sub.credits_total) * 100;
      return percentage <= 10 && percentage > 0;
    }) || [];

    logger.info('Found users with low credits', { count: usersToNotify.length });

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const userSub of usersToNotify) {
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          userSub.user_id
        );

        if (userError || !userData.user?.email) {
          logger.error('Could not get email for user', { userId: userSub.user_id });
          emailsFailed++;
          continue;
        }

        // Check if we've sent an alert in the last 24 hours
        const { data: recentAlerts } = await supabase
          .from('cron_job_logs')
          .select('created_at')
          .eq('job_name', 'low-credit-alert')
          .eq('user_id', userSub.user_id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (recentAlerts && recentAlerts.length > 0) {
          logger.debug('Already sent alert in last 24h', { email: userData.user.email });
          continue;
        }

        // Send email via Resend
        if (RESEND_API_KEY) {
          const percentage = Math.round((userSub.credits_remaining / userSub.credits_total) * 100);
          const tierName = (userSub as any).subscription_tiers?.tier_name || 'your plan';

          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'AI Assistant <notifications@yourdomain.com>',
              to: [userData.user.email],
              subject: '⚠️ Low Credit Alert - Time to Recharge!',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .stats { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>⚠️ Low Credit Alert</h1>
                      <p>Your AI credits are running low!</p>
                    </div>
                    <div class="content">
                      <div class="alert-box">
                        <strong>You have ${percentage}% of your credits remaining</strong>
                      </div>
                      
                      <div class="stats">
                        <h3>Current Status:</h3>
                        <ul>
                          <li><strong>Credits Remaining:</strong> ${userSub.credits_remaining} / ${userSub.credits_total}</li>
                          <li><strong>Current Plan:</strong> ${tierName}</li>
                        </ul>
                      </div>
                      
                      <p>
                        Don't let your AI assistant run out of steam! Your credits are running low, which means your 
                        sessions may be interrupted soon.
                      </p>
                      
                      <p>
                        <strong>What happens when you run out?</strong><br>
                        Once your credits hit zero, you won't be able to start new AI sessions until you upgrade or 
                        your credits renew.
                      </p>
                      
                      <center>
                        <a href="https://yourapp.com/pricing" class="button">
                          Upgrade Your Plan →
                        </a>
                      </center>
                      
                      <div class="footer">
                        <p>Need help? Contact us anytime at support@yourapp.com</p>
                        <p style="font-size: 12px; color: #999;">
                          This is an automated notification. You're receiving this because your credit balance is low.
                        </p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `,
            }),
          });

          if (!emailResponse.ok) {
            const error = await emailResponse.text();
            throw new Error(`Resend API error: ${error}`);
          }

          // Log successful alert
          await supabase.from('cron_job_logs').insert({
            job_name: 'low-credit-alert',
            user_id: userSub.user_id,
            status: 'success',
            metrics: {
              credits_remaining: userSub.credits_remaining,
              credits_total: userSub.credits_total,
              percentage: percentage,
              email: userData.user.email
            }
          });

          emailsSent++;
          logger.info('Sent low credit alert', { email: userData.user.email });
        } else {
          logger.warn('RESEND_API_KEY not configured, skipping email');
          emailsFailed++;
        }

      } catch (error) {
        logger.error('Error sending alert to user', { userId: userSub.user_id, error });
        emailsFailed++;
      }
    }

    logger.info('Low credit alert process complete', { sent: emailsSent, failed: emailsFailed });

    return successResponse({
      success: true,
      users_checked: lowCreditUsers?.length || 0,
      alerts_sent: emailsSent,
      alerts_failed: emailsFailed,
      message: `Sent ${emailsSent} low credit alerts`
    }, requestId);

  } catch (error) {
    return handleError({
      functionName: 'send-low-credit-alert',
      error,
      requestId
    });
  }
});
