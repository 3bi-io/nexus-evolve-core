-- Add RLS policies for remaining tables with correct column references

-- 1. tool_execution_metrics: Agent owners can view their tool metrics
CREATE POLICY "Agent owners can view tool metrics"
ON public.tool_execution_metrics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = tool_execution_metrics.agent_id
    AND user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can create tool metrics"
ON public.tool_execution_metrics
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = tool_execution_metrics.agent_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "System can update tool metrics"
ON public.tool_execution_metrics
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.custom_agents
    WHERE id = tool_execution_metrics.agent_id
    AND user_id = auth.uid()
  )
);

-- 2. workflow_executions: Users can view their own workflow executions
CREATE POLICY "Users can view their workflow executions"
ON public.workflow_executions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can create workflow executions"
ON public.workflow_executions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their workflow executions"
ON public.workflow_executions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());