import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { navSections } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const collapsed = state === "collapsed";

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  // Filter sections based on user state
  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Show admin-only items only to admins
        if (item.adminOnly && !isAdmin) return false;
        
        // For public items, always show
        if (item.public) return true;
        
        // For non-public items, only show if user is authenticated
        if (!item.public && !user) return false;
        
        return true;
      })
    }))
    .filter(section => section.items.length > 0); // Remove empty sections

  return (
    <Sidebar collapsible="icon" className="border-r">
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <span className="font-semibold text-lg">Oneiros</span>
          </div>
        )}
      </div>

      <SidebarContent>
        {filteredSections.map((section) => {
          return (
            <SidebarGroup key={section.id}>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const active = isActive(item.to);
                    const Icon = item.icon;

                    const menuButton = (
                      <SidebarMenuButton 
                        asChild 
                        isActive={active}
                        className={active ? "bg-primary/10 text-primary font-medium" : ""}
                      >
                        <NavLink to={item.to} end>
                          <Icon className="w-4 h-4" />
                          {!collapsed && (
                            <span className="flex items-center justify-between flex-1">
                              {item.label}
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem key={item.to}>
                        {collapsed && item.description ? (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {menuButton}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="flex flex-col gap-1">
                                <span className="font-medium">{item.label}</span>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          menuButton
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer with user info or sign in prompt */}
      <div className="mt-auto border-t p-4">
        {!user && !collapsed && (
          <NavLink to="/auth">
            <SidebarMenuButton className="w-full">
              <Settings className="w-4 h-4" />
              <span>Sign In</span>
            </SidebarMenuButton>
          </NavLink>
        )}
      </div>
    </Sidebar>
  );
}
