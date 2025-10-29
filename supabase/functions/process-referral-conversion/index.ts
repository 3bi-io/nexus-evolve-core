import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Check if user has sufficient activity (3+ interactions)
    const { count: interactionCount } = await supabaseClient
      .from("interactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (!interactionCount || interactionCount < 3) {
      return new Response(
        JSON.stringify({ 
          converted: false, 
          reason: "Insufficient activity" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find referral for this user
    const { data: referral, error: referralError } = await supabaseClient
      .from("referrals")
      .select("id, referrer_id, status")
      .eq("referred_user_id", userId)
      .eq("status", "signed_up")
      .single();

    if (referralError || !referral) {
      return new Response(
        JSON.stringify({ 
          converted: false, 
          reason: "No pending referral found" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update referral to converted
    const { error: updateError } = await supabaseClient
      .from("referrals")
      .update({ 
        status: "converted",
        converted_at: new Date().toISOString()
      })
      .eq("id", referral.id);

    if (updateError) throw updateError;

    // Give referrer bonus 50 credits for conversion
    const { error: rewardError } = await supabaseClient
      .from("referral_rewards")
      .insert({
        user_id: referral.referrer_id,
        referral_id: referral.id,
        reward_type: "credits",
        reward_value: 50
      });

    if (rewardError) throw rewardError;

    console.log(`Referral converted for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        converted: true,
        referralId: referral.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error processing referral conversion:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
