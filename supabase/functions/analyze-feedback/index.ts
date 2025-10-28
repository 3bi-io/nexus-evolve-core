import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Invalid user token");

    const { timeframe = 30 } = await req.json();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframe);

    console.log(`Analyzing feedback for user ${user.id} from last ${timeframe} days`);

    // Fetch rated interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .not("quality_rating", "is", null)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (interactionsError) throw interactionsError;

    if (!interactions || interactions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No rated interactions to analyze", behaviors_created: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Separate positive and negative interactions
    const positiveInteractions = interactions.filter(i => (i.quality_rating || 0) > 0);
    const negativeInteractions = interactions.filter(i => (i.quality_rating || 0) < 0);

    console.log(`Found ${positiveInteractions.length} positive, ${negativeInteractions.length} negative interactions`);

    // Prepare analysis prompt
    const analysisPrompt = `Analyze these user interactions and extract behavioral patterns that will improve AI responses.

HIGH-RATED INTERACTIONS (User liked these - ${positiveInteractions.length} total):
${positiveInteractions.slice(0, 10).map(i => 
  `Rating: ${i.quality_rating}\nUser: ${i.message}\nAssistant: ${i.response?.substring(0, 500)}...`
).join('\n---\n')}

LOW-RATED INTERACTIONS (User disliked these - ${negativeInteractions.length} total):
${negativeInteractions.slice(0, 10).map(i => 
  `Rating: ${i.quality_rating}\nUser: ${i.message}\nAssistant: ${i.response?.substring(0, 500)}...`
).join('\n---\n')}

Extract actionable behavioral patterns in JSON format. Return an array of behaviors with:
- behavior_type: one of ['response_style', 'reasoning_pattern', 'topic_focus', 'communication_preference', 'context_usage', 'capability_preference']
- description: Clear instruction for how AI should behave (e.g., "Keep technical responses concise with code examples")
- effectiveness_score: 0.0-1.0 based on consistency of pattern (higher rating count = higher score)
- created_from: 'positive_feedback' or 'negative_feedback'
- sample_ids: array of interaction IDs that support this pattern

Focus on:
1. Response style preferences (length, tone, detail level)
2. Reasoning patterns that work well
3. Topics where user is most/least satisfied
4. Communication preferences (technical level, examples, formatting)

Return ONLY valid JSON array of behaviors.`;

    // Call AI to analyze patterns
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a behavioral pattern analyst. Extract actionable AI behavior improvements from user feedback." },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis error:", errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;
    
    // Extract JSON from response
    let behaviors = [];
    try {
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        behaviors = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      throw new Error("AI returned invalid JSON");
    }

    console.log(`Extracted ${behaviors.length} behavioral patterns`);

    // Store adaptive behaviors
    let behaviorsCreated = 0;
    let behaviorsUpdated = 0;
    const newBehaviorIds = [];

    for (const behavior of behaviors) {
      // Check if similar behavior exists
      const { data: existing } = await supabase
        .from("adaptive_behaviors")
        .select("id, effectiveness_score, application_count")
        .eq("user_id", user.id)
        .eq("behavior_type", behavior.behavior_type)
        .ilike("description", `%${behavior.description.substring(0, 30)}%`)
        .single();

      if (existing) {
        // Update existing behavior with new effectiveness score (weighted average)
        const newScore = (existing.effectiveness_score * 0.7) + (behavior.effectiveness_score * 0.3);
        await supabase
          .from("adaptive_behaviors")
          .update({
            effectiveness_score: newScore,
            sample_interaction_ids: behavior.sample_ids || [],
            metadata: { last_analysis: new Date().toISOString(), ...behavior.metadata }
          })
          .eq("id", existing.id);
        behaviorsUpdated++;
      } else {
        // Create new behavior
        const { data: newBehavior, error: insertError } = await supabase
          .from("adaptive_behaviors")
          .insert({
            user_id: user.id,
            behavior_type: behavior.behavior_type,
            description: behavior.description,
            effectiveness_score: behavior.effectiveness_score,
            created_from: behavior.created_from,
            sample_interaction_ids: behavior.sample_ids || [],
            metadata: { analysis_date: new Date().toISOString() }
          })
          .select()
          .single();

        if (!insertError && newBehavior) {
          newBehaviorIds.push(newBehavior.id);
          behaviorsCreated++;
        }
      }
    }

    // Deactivate low-performing behaviors
    const { data: lowPerformers } = await supabase
      .from("adaptive_behaviors")
      .select("id")
      .eq("user_id", user.id)
      .eq("active", true)
      .lt("effectiveness_score", 0.3)
      .gt("application_count", 5);

    let behaviorsDeactivated = 0;
    if (lowPerformers && lowPerformers.length > 0) {
      await supabase
        .from("adaptive_behaviors")
        .update({ active: false })
        .in("id", lowPerformers.map(b => b.id));
      behaviorsDeactivated = lowPerformers.length;
    }

    // Log evolution
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "behavior_analysis",
      description: `Analyzed ${interactions.length} interactions and updated adaptive behaviors`,
      change_type: "behavior_modified",
      metrics: {
        interactions_analyzed: interactions.length,
        positive_interactions: positiveInteractions.length,
        negative_interactions: negativeInteractions.length,
        behaviors_created: behaviorsCreated,
        behaviors_updated: behaviorsUpdated,
        behaviors_deactivated: behaviorsDeactivated,
        timeframe_days: timeframe
      },
      success: true
    });

    console.log(`Analysis complete: ${behaviorsCreated} created, ${behaviorsUpdated} updated, ${behaviorsDeactivated} deactivated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Analyzed ${interactions.length} interactions`,
        behaviors_created: behaviorsCreated,
        behaviors_updated: behaviorsUpdated,
        behaviors_deactivated: behaviorsDeactivated,
        new_behavior_ids: newBehaviorIds
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-feedback error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
