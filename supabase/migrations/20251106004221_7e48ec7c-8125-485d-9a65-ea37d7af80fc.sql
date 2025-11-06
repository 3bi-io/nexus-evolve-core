-- Add RLS policies for tables missing them

-- 1. agent_improvement_suggestions: Only admins and agent owners can view
CREATE POLICY "Agent owners can view their agent suggestions"
ON public.agent_improvement_suggestions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_improvement_suggestions.agent_id
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can create suggestions"
ON public.agent_improvement_suggestions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Agent owners can update suggestion status"
ON public.agent_improvement_suggestions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_improvement_suggestions.agent_id
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2. agent_knowledge_links: Agent owners can manage
CREATE POLICY "Agent owners can view knowledge links"
ON public.agent_knowledge_links
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_knowledge_links.agent_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Agent owners can add knowledge links"
ON public.agent_knowledge_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_knowledge_links.agent_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Agent owners can delete knowledge links"
ON public.agent_knowledge_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_knowledge_links.agent_id
    AND user_id = auth.uid()
  )
);

-- 3. agent_test_results: Agent owners can view test results
CREATE POLICY "Agent owners can view test results"
ON public.agent_test_results
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_test_suites ats
    JOIN public.custom_agents ca ON ca.id = ats.agent_id
    WHERE ats.id = agent_test_results.test_suite_id
    AND ca.user_id = auth.uid()
  )
);

CREATE POLICY "System can create test results"
ON public.agent_test_results
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. agent_versions: Agent owners can view versions
CREATE POLICY "Agent owners can view versions"
ON public.agent_versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_versions.agent_id
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Agent owners can create versions"
ON public.agent_versions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = agent_versions.agent_id
    AND user_id = auth.uid()
  )
);

-- 5. conversation_titles: Users can manage their conversation titles
CREATE POLICY "Users can view their conversation titles"
ON public.conversation_titles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac
    WHERE ac.id = conversation_titles.conversation_id
    AND ac.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their conversation titles"
ON public.conversation_titles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac
    WHERE ac.id = conversation_titles.conversation_id
    AND ac.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their conversation titles"
ON public.conversation_titles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac
    WHERE ac.id = conversation_titles.conversation_id
    AND ac.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their conversation titles"
ON public.conversation_titles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_conversations ac
    WHERE ac.id = conversation_titles.conversation_id
    AND ac.user_id = auth.uid()
  )
);