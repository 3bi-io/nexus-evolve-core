import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SystemOverview } from "@/components/admin/sections/SystemOverview";
import { UserManagement } from "@/components/admin/sections/UserManagement";
import { DataManagement } from "@/components/admin/sections/DataManagement";
import { FinancialDashboard } from "@/components/admin/sections/FinancialDashboard";
import { SystemConfig } from "@/components/admin/sections/SystemConfig";
import { SecurityCenter } from "@/components/admin/sections/SecurityCenter";
import { AnnouncementCenter } from "@/components/admin/sections/AnnouncementCenter";
import { DevTools } from "@/components/admin/sections/DevTools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export default function SuperAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState("overview");
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
      <PageLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p>Loading...</p>
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <SEO 
          title="Super Admin - Access Denied"
          description="Super admin dashboard - restricted access for authorized administrators only."
          canonical="https://oneiros.me/admin"
        />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <BreadcrumbNav />
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have super admin privileges.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const renderSection = () => {
    switch (section) {
      case "overview":
        return <SystemOverview />;
      case "analytics":
        return <SystemOverview />;
      case "users":
        return <UserManagement />;
      case "agents":
        return <DataManagement />;
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
      default:
        return <SystemOverview />;
    }
  };

  return (
    <PageLayout showFooter={false}>
      <SEO 
        title="Super Admin - System Management Dashboard"
        description="Comprehensive super admin dashboard for managing users, agents, data, finances, security, and system configuration."
        canonical="https://oneiros.me/admin"
      />
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar section={section} onSectionChange={setSection} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <BreadcrumbNav />
            {renderSection()}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
