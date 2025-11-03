import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PruneRequest {
  user_id?: string; // Optional: prune for specific user, otherwise prune all
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const MEM0_API_KEY = Deno.env.get("MEM0_API_KEY");
    if (!MEM0_API_KEY) throw new Error("MEM0_API_KEY not configured");

    const body: PruneRequest = await req.json().catch(() => ({}));
    const targetUserId = body.user_id;

    let totalPruned = 0;
    let totalStorageSaved = 0;

    // Get users to prune (either specific user or all with auto-pruning enabled)
    const { data: users, error: usersError } = targetUserId
      ? await supabase.from("user_memory_preferences").select("*").eq("user_id", targetUserId)
      : await supabase.from("user_memory_preferences").select("*").eq("auto_pruning_enabled", true);

    if (usersError) throw usersError;

    for (const userPref of users || []) {
      const userId = userPref.user_id;
      const aggressiveness = userPref.pruning_aggressiveness;
      const minAgeDays = userPref.min_age_days;
      const relevanceThreshold = userPref.relevance_threshold;

      console.log(`Pruning memories for user ${userId} with ${aggressiveness} aggressiveness`);

      // Adjust threshold based on aggressiveness
      let adjustedThreshold = relevanceThreshold;
      if (aggressiveness === "conservative") adjustedThreshold *= 0.7;
      if (aggressiveness === "aggressive") adjustedThreshold *= 1.3;

      // Get all memories for user from Mem0
      const memResponse = await fetch(`https://api.mem0.ai/v1/memories/?user_id=${userId}`, {
        headers: {
          Authorization: `Token ${MEM0_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!memResponse.ok) {
        console.error(`Failed to fetch memories for user ${userId}`);
        continue;
      }

      const memories = await memResponse.json();

      // Get temporal scores for these memories
      const { data: scores } = await supabase
        .from("memory_temporal_scores")
        .select("*")
        .eq("user_id", userId);

      const prunedMemoryIds: string[] = [];
      let storageSaved = 0;

      for (const memory of memories.results || []) {
        const score = scores?.find(s => s.memory_id === memory.id);
        
        if (!score) continue;

        // Calculate age in days
        const ageInDays = (Date.now() - new Date(score.created_at).getTime()) / (1000 * 60 * 60 * 24);

        // Decide if memory should be pruned
        const shouldPrune = 
          ageInDays >= minAgeDays && 
          (score.calculated_relevance || 0) < adjustedThreshold;

        if (shouldPrune) {
          // Delete from Mem0
          const deleteResponse = await fetch(`https://api.mem0.ai/v1/memories/${memory.id}/`, {
            method: "DELETE",
            headers: {
              Authorization: `Token ${MEM0_API_KEY}`,
              "Content-Type": "application/json",
            },
          });

          if (deleteResponse.ok) {
            prunedMemoryIds.push(memory.id);
            
            // Estimate storage saved (rough estimate: 1KB per memory)
            storageSaved += 1;

            // Delete temporal score
            await supabase
              .from("memory_temporal_scores")
              .delete()
              .eq("user_id", userId)
              .eq("memory_id", memory.id);
          }
        }
      }

      // Log pruning operation
      if (prunedMemoryIds.length > 0) {
        await supabase.from("memory_pruning_logs").insert({
          user_id: userId,
          pruned_count: prunedMemoryIds.length,
          storage_saved_kb: storageSaved,
          threshold_used: adjustedThreshold,
          pruned_memory_ids: prunedMemoryIds,
        });

        totalPruned += prunedMemoryIds.length;
        totalStorageSaved += storageSaved;

        console.log(`Pruned ${prunedMemoryIds.length} memories for user ${userId}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_pruned: totalPruned,
        total_storage_saved_kb: totalStorageSaved,
        users_processed: users?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Auto-prune error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
