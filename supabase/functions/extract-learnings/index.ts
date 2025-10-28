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
    const { sessionId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token || "");

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch interactions for the session with quality ratings
    const { data: interactions, error: interactionsError } = await supabase
      .from("interactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (interactionsError || !interactions || interactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No interactions found for this session" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate conversation quality metrics
    const ratingsGiven = interactions.filter(i => i.quality_rating !== null);
    const avgRating = ratingsGiven.length > 0 
      ? ratingsGiven.reduce((sum, i) => sum + (i.quality_rating || 0), 0) / ratingsGiven.length 
      : 3;
    
    const highQualityInteractions = interactions.filter(i => (i.quality_rating || 0) >= 4);
    const lowQualityInteractions = interactions.filter(i => i.quality_rating && i.quality_rating <= 2);

    // Build conversation text with quality indicators
    const conversationText = interactions
      .map(i => {
        const rating = i.quality_rating ? ` [Rating: ${i.quality_rating}/5]` : '';
        return `User: ${i.message}\nAssistant: ${i.response || '(no response)'}${rating}`;
      })
      .join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced AI analysis prompt
    const analysisPrompt = `Analyze this conversation and extract intelligent learnings. Pay special attention to highly-rated interactions (4-5 stars) as they represent successful patterns.

Conversation Quality Metrics:
- Average Rating: ${avgRating.toFixed(2)}/5
- High Quality Interactions: ${highQualityInteractions.length}
- Low Quality Interactions: ${lowQualityInteractions.length}
- Total Interactions: ${interactions.length}

Conversation:
${conversationText}

Extract the following in JSON format:
{
  "facts": [
    {
      "content": "specific fact learned",
      "importance": 0.0-1.0 (higher for facts from high-rated interactions),
      "context": "why this matters"
    }
  ],
  "topics": [
    {
      "topic": "main topic discussed",
      "content": "key insights about this topic",
      "importance": 0.0-1.0,
      "tags": ["relevant", "tags"]
    }
  ],
  "solutions": [
    {
      "problem": "problem that was addressed",
      "solution": "how it was solved",
      "success_score": 0.0-1.0 (based on user rating),
      "solution_path": ["step 1", "step 2", ...],
      "reasoning_steps": ["reasoning 1", "reasoning 2", ...]
    }
  ],
  "patterns": [
    {
      "pattern_type": "communication_style|reasoning_approach|user_preference|knowledge_gap",
      "description": "pattern observed",
      "importance": 0.0-1.0,
      "evidence": "what indicates this pattern"
    }
  ],
  "user_preferences": {
    "communication_style": "observed preferences",
    "topic_interests": ["topics user engaged with"],
    "response_preferences": "what kind of responses got high ratings"
  }
}

Focus on:
1. Extracting actionable patterns from high-rated interactions
2. Identifying what makes responses successful
3. Understanding user preferences and communication style
4. Finding knowledge gaps (topics with low ratings or confusion)
5. Documenting successful problem-solving approaches`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert at analyzing conversations and extracting meaningful learnings." },
          { role: "user", content: analysisPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI analysis error:", aiResponse.status, errorText);
      throw new Error("Failed to analyze conversation");
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }
    
    const learnings = JSON.parse(jsonMatch[0]);

    // Store learnings with enhanced metadata
    let storedCount = 0;

    // Store facts in agent_memory
    if (learnings.facts && Array.isArray(learnings.facts)) {
      for (const fact of learnings.facts) {
        await supabase.from("agent_memory").insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: "fact",
          context_summary: fact.content,
          content: { 
            fact: fact.content,
            context: fact.context,
            source: 'conversation_analysis',
            session_quality: avgRating
          },
          importance_score: fact.importance || 0.5,
          metadata: { extracted_at: new Date().toISOString() }
        });
        storedCount++;
      }
    }

    // Store topics in knowledge_base
    if (learnings.topics && Array.isArray(learnings.topics)) {
      for (const topicData of learnings.topics) {
        await supabase.from("knowledge_base").insert({
          user_id: user.id,
          topic: topicData.topic,
          content: topicData.content,
          source_type: 'conversation',
          source_reference: sessionId,
          tags: topicData.tags || [],
          importance_score: topicData.importance || 0.5,
          metadata: { 
            extracted_at: new Date().toISOString(),
            session_quality: avgRating
          }
        });
        storedCount++;
      }
    }

    // Store solutions in problem_solutions
    if (learnings.solutions && Array.isArray(learnings.solutions)) {
      for (const solution of learnings.solutions) {
        await supabase.from("problem_solutions").insert({
          user_id: user.id,
          problem_description: solution.problem,
          solution: solution.solution,
          success_score: solution.success_score || 0.5,
          solution_path: solution.solution_path || [],
          reasoning_steps: solution.reasoning_steps || [],
          metadata: { 
            extracted_at: new Date().toISOString(),
            session_id: sessionId,
            session_quality: avgRating
          }
        });
        storedCount++;
      }
    }

    // Store patterns in agent_memory
    if (learnings.patterns && Array.isArray(learnings.patterns)) {
      for (const pattern of learnings.patterns) {
        await supabase.from("agent_memory").insert({
          user_id: user.id,
          session_id: sessionId,
          memory_type: pattern.pattern_type,
          context_summary: pattern.description,
          content: { 
            pattern: pattern.description,
            evidence: pattern.evidence,
            source: 'pattern_analysis',
            session_quality: avgRating
          },
          importance_score: pattern.importance || 0.5,
          metadata: { extracted_at: new Date().toISOString() }
        });
        storedCount++;
      }
    }

    // Store user preferences as a special memory
    if (learnings.user_preferences) {
      await supabase.from("agent_memory").insert({
        user_id: user.id,
        session_id: sessionId,
        memory_type: "user_preference",
        context_summary: "User communication and response preferences",
        content: learnings.user_preferences,
        importance_score: 0.8, // High importance for preferences
        metadata: { 
          extracted_at: new Date().toISOString(),
          session_quality: avgRating
        }
      });
      storedCount++;
    }

    // Log the learning extraction with enhanced metrics
    await supabase.from("evolution_logs").insert({
      user_id: user.id,
      log_type: "learning_extraction",
      change_type: "knowledge_acquired",
      description: `Extracted ${storedCount} learnings from session with avg rating ${avgRating.toFixed(2)}/5`,
      metrics: {
        learnings_count: storedCount,
        session_quality: avgRating,
        high_quality_count: highQualityInteractions.length,
        low_quality_count: lowQualityInteractions.length,
        facts_extracted: learnings.facts?.length || 0,
        topics_extracted: learnings.topics?.length || 0,
        solutions_extracted: learnings.solutions?.length || 0,
        patterns_extracted: learnings.patterns?.length || 0
      },
      success: true
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        learnings_stored: storedCount,
        session_quality: avgRating,
        summary: {
          total_learnings: storedCount,
          facts: learnings.facts?.length || 0,
          topics: learnings.topics?.length || 0,
          solutions: learnings.solutions?.length || 0,
          patterns: learnings.patterns?.length || 0,
          preferences: learnings.user_preferences ? 1 : 0
        },
        breakdown: {
          facts: learnings.facts?.length || 0,
          topics: learnings.topics?.length || 0,
          solutions: learnings.solutions?.length || 0,
          patterns: learnings.patterns?.length || 0,
          preferences: learnings.user_preferences ? 1 : 0
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extract learnings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
