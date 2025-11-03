import { logAdminAction, AdminActionParams } from "@/lib/admin-utils";
import { useToast } from "@/hooks/use-toast";

export function useAdminAudit() {
  const { toast } = useToast();

  const logAction = async (params: AdminActionParams) => {
    const actionId = await logAdminAction(params);
    
    if (!actionId) {
      toast({
        title: "Warning",
        description: "Action completed but logging failed",
        variant: "destructive",
      });
    }
    
    return actionId;
  };

  return { logAction };
}
