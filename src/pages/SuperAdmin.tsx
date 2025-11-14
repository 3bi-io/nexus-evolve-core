import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoading } from "@/components/ui/loading-state";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { StatsHeader } from "@/components/admin/StatsHeader";
import { SystemOverview } from "@/components/admin/sections/SystemOverview";
import { UserManagement } from "@/components/admin/sections/UserManagement";
import { DataManagement } from "@/components/admin/sections/DataManagement";
import { FinancialDashboard } from "@/components/admin/sections/FinancialDashboard";
import { SystemConfig } from "@/components/admin/sections/SystemConfig";
import { SecurityCenter } from "@/components/admin/sections/SecurityCenter";
import { AnnouncementCenter } from "@/components/admin/sections/AnnouncementCenter";
import { DevTools } from "@/components/admin/sections/DevTools";
import { AgentManagement } from "@/components/admin/sections/AgentManagement";
import { UserAnalytics } from "@/components/admin/sections/UserAnalytics";
import { AgentAnalyticsOverview } from "@/components/admin/sections/AgentAnalyticsOverview";
import { AuditLog } from "@/components/admin/sections/AuditLog";
import { UpdateManagement } from "@/components/admin/sections/UpdateManagement";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";

export default function SuperAdmin() {
  const { user } = useAuth();
  const { section = "overview" } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    setIsAdmin(!!data && !error);
    setLoading(false);
  };

  if (loading) {
    return (
      <AppLayout title="Admin Panel" showBottomNav>
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <PageLoading />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout title="Admin Panel" showBottomNav>
        <SEO
          title="Super Admin - Access Denied"
          description="Super admin dashboard - restricted access for authorized administrators only."
          canonical="https://oneiros.me/admin"
        />
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          <BreadcrumbNav />
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have super admin privileges.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <SystemOverview />;
      case "users":
        return <UserManagement />;
      case "agents":
        return <AgentManagement />;
      case "data":
        return <DataManagement />;
      case "financial":
        return <FinancialDashboard />;
      case "config":
        return <SystemConfig />;
      case "security":
        return <SecurityCenter />;
      case "announcements":
        return <AnnouncementCenter />;
      case "devtools":
        return <DevTools />;
      case "updates":
        return <UpdateManagement />;
      case "user-analytics":
        return <UserAnalytics />;
      case "agent-analytics":
        return <AgentAnalyticsOverview />;
      case "audit-log":
        return <AuditLog />;
      default:
        return <SystemOverview />;
    }
  };

  return (
    <ErrorBoundaryWrapper
      fallbackTitle="Admin Dashboard Error"
      fallbackMessage="The admin dashboard encountered an error. Please try refreshing the page."
    >
      <AppLayout title="Admin - System Management" showBottomNav>
      <SEO
        title="Super Admin - System Management Dashboard"
        description="Comprehensive super admin dashboard for managing users, agents, data, finances, security, and system configuration across the unified AI platform."
        canonical="https://oneiros.me/admin"
      />
      {/* Mobile-First Layout with admin theme */}
      <div className={cn(
        "admin-panel",
        "flex flex-col md:flex-row",
        "min-h-screen md:h-[calc(100vh-4rem)]"
      )}>
        <AdminSidebar 
          section={section} 
          onSectionChange={(s) => navigate(`/admin/${s}`)} 
        />
        
        {/* Main Content Area */}
        <main className={cn(
          "flex-1",
          "overflow-y-auto",
          "pb-20 md:pb-0", // Space for mobile bottom nav
          "safe-bottom"
        )}>
          <div className={cn(
            "container-mobile", // Responsive padding
            "py-4 sm:py-6 md:py-8",
            "space-mobile" // Responsive spacing
          )}>
            {/* Breadcrumbs - Hidden on small mobile */}
            <div className="hidden sm:block">
              <BreadcrumbNav />
            </div>
            
            {/* Stats Header - Responsive */}
            <StatsHeader />
            
            {/* Section Content */}
            {renderSection()}
          </div>
        </main>
      </div>
      </AppLayout>
    </ErrorBoundaryWrapper>
  );
}
