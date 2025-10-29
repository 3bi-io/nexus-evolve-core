-- Update RLS policies to allow super_admins to manage all data

-- Knowledge Base policies for super admins
CREATE POLICY "Super admins can view all knowledge"
ON public.knowledge_base
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all knowledge"
ON public.knowledge_base
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Agent Memory policies for super admins
CREATE POLICY "Super admins can view all memories"
ON public.agent_memory
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all memories"
ON public.agent_memory
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all memories"
ON public.agent_memory
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Interactions policies for super admins
CREATE POLICY "Super admins can view all interactions"
ON public.interactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all interactions"
ON public.interactions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

-- Sessions policies for super admins
CREATE POLICY "Super admins can view all sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all sessions"
ON public.sessions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));